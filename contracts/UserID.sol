// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./core/lib/TFHE.sol";
import "./IdStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @dev Implements role-based access control for registrars and admins to manage identity registration
contract UserID is AccessControl {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");

    error AlreadyRegistered();
    error IdentityNotRegistered();
    error AccessNotPermitted();
    error ClaimGenerationFailed(bytes data);

    /// @dev Structure to hold encrypted identity data
    struct Identity {
        euint64 id; /// @dev Encrypted unique ID
        euint64 adhaarCard; /// @dev Encrypted Aadhar card number
        ebytes256 firstname; /// @dev Encrypted first name
        ebytes256 lastname; /// @dev Encrypted last name
        euint64 birthdate; /// @dev Encrypted birthdate for age verification in EPOCH format
    }

    IdStorage private idStorage;

    /// @dev Mapping to store identities by user ID
    mapping(uint256 => Identity) private citizenIdentities;
    /// @dev Mapping to track registered identities
    mapping(uint256 => bool) public registered;

    event IdentityRegistered(address indexed user);

    constructor(address _idStorageAddress) {
        idStorage = IdStorage(_idStorageAddress);
        _grantRole(OWNER_ROLE, msg.sender); /// @dev Admin role for contract owner
        _grantRole(REGISTRAR_ROLE, msg.sender); /// @dev Registrar role for contract owner
    }

    function addRegistrar(address registrar) external onlyRole(OWNER_ROLE) {
        _grantRole(REGISTRAR_ROLE, registrar);
    }

    function removeRegistrar(address registrar) external onlyRole(OWNER_ROLE) {
        _revokeRole(REGISTRAR_ROLE, registrar);
    }

    ///Creates a new encrypted identity record
    ///@dev Only admin role can register new identities. All data is stored in encrypted form
    function registerIdentity(
        uint256 userId,
        einput adhaarCard,
        einput firstname,
        einput lastname,
        einput birthdate,
        bytes calldata inputProof
    ) public virtual onlyRole(REGISTRAR_ROLE) returns (bool) {
        if (registered[userId]) revert AlreadyRegistered();

        /// @dev Generate a new encrypted unique ID
        euint64 newId = TFHE.randEuint64();

        /// @dev Store the encrypted identity data
        citizenIdentities[userId] = Identity({
            id: newId,
            adhaarCard: TFHE.asEuint64(adhaarCard, inputProof),
            firstname: TFHE.asEbytes256(firstname, inputProof),
            lastname: TFHE.asEbytes256(lastname, inputProof),
            birthdate: TFHE.asEuint64(birthdate, inputProof)
        });

        registered[userId] = true; /// @dev Mark the identity as registered

        /// @dev Get the address associated with the user ID
        address addressToBeAllowed = idStorage.getAddr(userId);

        /// @dev Allow the user to access their own data
        TFHE.allow(citizenIdentities[userId].id, addressToBeAllowed);
        TFHE.allow(citizenIdentities[userId].adhaarCard, addressToBeAllowed);
        TFHE.allow(citizenIdentities[userId].firstname, addressToBeAllowed);
        TFHE.allow(citizenIdentities[userId].lastname, addressToBeAllowed);
        TFHE.allow(citizenIdentities[userId].birthdate, addressToBeAllowed);

        /// @dev Allow the contract to access the data
        TFHE.allow(citizenIdentities[userId].id, address(this));
        TFHE.allow(citizenIdentities[userId].adhaarCard, address(this));
        TFHE.allow(citizenIdentities[userId].firstname, address(this));
        TFHE.allow(citizenIdentities[userId].lastname, address(this));
        TFHE.allow(citizenIdentities[userId].birthdate, address(this));

        emit IdentityRegistered(addressToBeAllowed); /// @dev Emit event for identity registration
        return true;
    }

    /// Retrieves the complete encrypted identity record for a user
    function getIdentity( uint256 userId) public view virtual returns (euint64, euint64, ebytes256, ebytes256, euint64){
        if (!registered[userId]) revert IdentityNotRegistered();
        return (
            citizenIdentities[userId].id,
            citizenIdentities[userId].adhaarCard,
            citizenIdentities[userId].firstname,
            citizenIdentities[userId].lastname,
            citizenIdentities[userId].birthdate
        );
    }

    function getBirthdate( uint256 userId ) public view virtual returns (euint64) {
        // Check registration first
        if (!registered[userId]) {
            revert IdentityNotRegistered();}

        // Get identity from storage
        Identity storage identity = citizenIdentities[userId];
        euint64 birthdate = identity.birthdate;

        return birthdate;
    }

    function getMyIdentityFirstname( uint256 userId ) public view virtual returns (ebytes256) {
        if (!registered[userId]) revert IdentityNotRegistered();
        return citizenIdentities[userId].firstname;
    }

    /// Generates a verification claim using the user's identity data
    /// @dev Temporarily grants claim contract access to required encrypted data
    /// @param claimAddress Contract address that will process the claim
    /// @param claimFn Function signature in the claim contract to call
    function generateClaim(address claimAddress, string memory claimFn) public {
        /// @dev Only the msg.sender that is registered under the user ID can make the claim
        uint256 userId = idStorage.getId(msg.sender);

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
