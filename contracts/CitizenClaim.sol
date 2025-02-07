// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./core/lib/TFHE.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import {UserID} from "./UserID.sol";
import {IdStorage} from "./IdStorage.sol";

contract CitizenClaim is Ownable2Step {
    /// @dev Age threshold timestamp for adult verification 
    uint64 private constant AGE_THRESHOLD_TIMESTAMP = 1738939891;
    /// @dev Constant representing an invalid claim ID
    uint256 private constant INVALID_CLAIM = 0;
    euint64 private _AGE_THRESHOLD;
    euint16 private _REQUIRED_DEGREE;

    error InvalidClaimId();
    error InvalidContractAddress();
    error NotAuthorized();

    /// @dev Counter for tracking the latest claim ID
    uint64 public lastClaimId = 0;
    /// @dev Mapping of claim IDs to encrypted boolean results for adult claims
    mapping(uint64 => ebool) private adultClaims;
    /// @dev Mapping of user IDs to encrypted boolean results for verified claims
    mapping(uint256 => ebool) private verifiedClaims;

    /// @dev Emitted when an adult claim is generated
    event AdultClaimGenerated(uint64 claimId, uint256 userId);
    /// @dev Emitted when a degree claim is generated
    event DegreeClaimGenerated(uint64 claimId, uint256 userId);

    /// @dev Instance of idStorage contract for user ID management
    IdStorage private idStorage;
    /// @dev Instance of UserID contract for identity verification
    UserID private passportContract;

    
    /// @dev Constructor to initialize the contract with required contract addresses
    constructor(
        address _idStorageAddress,
        address _USERIDAddress
    ) Ownable(msg.sender) {
        // TFHE.setFHEVM(FHEVMConfig.defaultConfig());
        if (_idStorageAddress == address(0) || _USERIDAddress == address(0))
            revert InvalidContractAddress();

        idStorage = IdStorage(_idStorageAddress);
        passportContract = UserID(_USERIDAddress);

        /// Set age threshold to 18 years (in Unix timestamp)
        _AGE_THRESHOLD = TFHE.asEuint64(AGE_THRESHOLD_TIMESTAMP);

        TFHE.allow(_AGE_THRESHOLD, address(this));
    }

    /// @dev Generates an encrypted claim verifying if a user is above 18 years old
    event BirthdateRetrieved(uint256 userId, euint64 birthdate);

    function generateAdultClaim(uint256 userId) public returns (uint64) {
        if (msg.sender != address(passportContract)) revert NotAuthorized();

        /// Retrieve the address associated with the user ID
        address addressToBeAllowed = idStorage.getAddr(userId);

        /// Retrieve the user's encrypted birthdate from the UserID contract
        euint64 birthdate = (passportContract.getBirthdate(userId));

        lastClaimId++;

        /// Check if birthdate indicates user is over 18
        ebool isAdult = TFHE.le(birthdate, _AGE_THRESHOLD);

        /// Store the result of the claim
        adultClaims[lastClaimId] = isAdult;

        /// Grant access to the claim to both the contract and user for verification purposes
        TFHE.allow(isAdult, address(this));
        TFHE.allow(isAdult, addressToBeAllowed);

        /// Emit an event for the generated claim
        emit AdultClaimGenerated(lastClaimId, userId);

        return lastClaimId;
    }
    
    /// @dev Retrieves the result of an adult claim
    function getAdultClaim(uint64 claimId) public view returns (ebool) {
        if (claimId == 0 || claimId > lastClaimId) revert InvalidClaimId();
        return adultClaims[claimId];
    }

 
     /// @dev Verifies both adult and degree claims for a user
    function verifyClaims(uint256 userId, uint64 adultClaim) public {
        if (adultClaim == INVALID_CLAIM || adultClaim > lastClaimId)
            revert InvalidClaimId();

        ebool isAdult = adultClaims[adultClaim];

        ebool verify = isAdult;

        /// Store the verification result under the userId mapping
        verifiedClaims[userId] = verify;

        /// Grant access to the claim
        TFHE.allow(verify, address(this));
        TFHE.allow(verify, owner());
    }

    /// @dev Retrieves the result of a verified claim for a user
    function getVerifyClaim(uint256 userId) public view returns (ebool) {
        return verifiedClaims[userId];
    }
}
