// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./core/lib/TFHE.sol";
import "./IdMapping.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract PassportID is AccessControl {
    /// @dev Constants
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");

    error AlreadyRegistered();
    error IdentityNotRegistered();
    error AccessNotPermitted();
    error ClaimGenerationFailed(bytes data);

    struct Identity {
        euint64 id; /// @dev Encrypted unique ID
        ebytes256 name; /// @dev Encrypted first name
        euint64 birthdate; /// @dev Encrypted birthdate for age verification
    }

    IdMapping private idMapping;
    mapping(uint256 => Identity) private citizenIdentities;
    mapping(uint256 => bool) public registered;

    event IdentityRegistered(address indexed user);

    constructor(address _idMappingAddress) {
        // TFHE.setFHEVM(FHEVMConfig.defaultConfig());
        idMapping = IdMapping(_idMappingAddress);
        _grantRole(OWNER_ROLE, msg.sender); /// @dev Admin role for contract owner
        _grantRole(REGISTRAR_ROLE, msg.sender); /// @dev Registrar role for contract owner
    }

    function addRegistrar(address registrar) external onlyRole(OWNER_ROLE) {
        _grantRole(REGISTRAR_ROLE, registrar);
    }

    function removeRegistrar(address registrar) external onlyRole(OWNER_ROLE) {
        _revokeRole(REGISTRAR_ROLE, registrar);
    }

    function registerIdentity(
        uint256 userId,
        einput name,
        einput birthdate,
        bytes calldata inputProof
    ) public virtual onlyRole(REGISTRAR_ROLE) returns (bool) {
        if (registered[userId]) revert AlreadyRegistered();

        /// @dev Generate a new encrypted unique ID
        euint64 newId = TFHE.randEuint64();

        /// @dev Store the encrypted identity data
        citizenIdentities[userId] = Identity({
            id: newId,
            name: TFHE.asEbytes256(name, inputProof),
            birthdate: TFHE.asEuint64(birthdate, inputProof)
        });

        registered[userId] = true; /// @dev Mark the identity as registered

        /// @dev Get the address associated with the user ID
        address addressToBeAllowed = idMapping.getAddr(userId);

        /// @dev Allow the user to access their own data
        TFHE.allow(citizenIdentities[userId].id, addressToBeAllowed);
        TFHE.allow(citizenIdentities[userId].name, addressToBeAllowed);
        TFHE.allow(citizenIdentities[userId].birthdate, addressToBeAllowed);

        /// @dev Allow the contract to access the data
        TFHE.allow(citizenIdentities[userId].id, address(this));
        TFHE.allow(citizenIdentities[userId].name, address(this));
        TFHE.allow(citizenIdentities[userId].birthdate, address(this));

        emit IdentityRegistered(addressToBeAllowed); /// @dev Emit event for identity registration

        return true;
    }

    function getIdentity(
        uint256 userId
    )
        public
        view
        virtual
        returns (euint64, ebytes256, euint64)
    {
        if (!registered[userId]) revert IdentityNotRegistered();
        return (
            citizenIdentities[userId].id,
            citizenIdentities[userId].name,
            citizenIdentities[userId].birthdate
        );
    }

    function getBirthdate(
        uint256 userId
    ) public view virtual returns (euint64) {
        // Check registration first
        if (!registered[userId]) {
            revert IdentityNotRegistered();
        }

        // Get identity from storage
        Identity storage identity = citizenIdentities[userId];
        euint64 birthdate = identity.birthdate;

        return birthdate;
    }

    function getMyIdentityName(
        uint256 userId
    ) public view virtual returns (ebytes256) {
        if (!registered[userId]) revert IdentityNotRegistered();
        return citizenIdentities[userId].name;
    }

    function generateClaim(address claimAddress, string memory claimFn) public {
        /// @dev Only the msg.sender that is registered under the user ID can make the claim
        uint256 userId = idMapping.getId(msg.sender);

        /// @dev Grant temporary access for citizen's birthdate to be used in claim generation
        TFHE.allowTransient(citizenIdentities[userId].birthdate, claimAddress);

        /// @dev Ensure the sender can access this citizen's birthdate
        if (!TFHE.isSenderAllowed(citizenIdentities[userId].birthdate))
            revert AccessNotPermitted();

        /// @dev Attempt the external call and capture the result
        (bool success, bytes memory data) = claimAddress.call(
            abi.encodeWithSignature(claimFn, userId)
        );
        if (!success) revert ClaimGenerationFailed(data);
    }
}
