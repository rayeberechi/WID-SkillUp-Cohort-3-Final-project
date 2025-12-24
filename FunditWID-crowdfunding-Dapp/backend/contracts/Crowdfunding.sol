// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Crowdfunding is ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public immutable USDC_ADDRESS;

    constructor(address _usdcAddress) {
        USDC_ADDRESS = _usdcAddress;
    }

    struct Campaign {
        address creator;
        IERC20 token;
        uint256 goal;
        uint256 deadline;
        uint256 raised;
        bool withdrawn;
    }

    uint256 public campaignCount;
    mapping(uint256 => Campaign) private campaigns;
    mapping(uint256 => mapping(address => uint256)) private contributions;

    event CampaignCreated(
        uint256 indexed id,
        address indexed creator,
        address indexed token,
        uint256 goal,
        uint256 deadline,
        string metadata
    );

    event ContributionReceived(
        uint256 indexed id,
        address indexed contributor,
        uint256 amount,
        uint256 newTotal
    );

    event Withdrawal(uint256 indexed id, address indexed creator, uint256 amount);
    event Refund(uint256 indexed id, address indexed contributor, uint256 amount);

    error InvalidGoal();
    error InvalidDuration();
    error CampaignNotFound(uint256 id);
    error PastDeadline();
    error CampaignEnded();
    error GoalNotMet();
    error NothingToWithdraw();
    error NotCreator();
    error NoContribution();

    function createCampaign(
        uint256 goal,
        uint256 duration,
        string calldata metadata
    ) external returns (uint256 id) {
        if (goal == 0) revert InvalidGoal();
        if (duration == 0) revert InvalidDuration();

        id = ++campaignCount;
        uint256 deadline = block.timestamp + duration;

        campaigns[id] = Campaign({
            creator: msg.sender,
            token: IERC20(USDC_ADDRESS),
            goal: goal,
            deadline: deadline,
            raised: 0,
            withdrawn: false
        });

        emit CampaignCreated(id, msg.sender, USDC_ADDRESS, goal, deadline, metadata);
    }

    function contribute(uint256 id, uint256 amount) external nonReentrant {
        Campaign storage campaign = campaigns[id];
        if (campaign.creator == address(0)) revert CampaignNotFound(id);
        if (block.timestamp > campaign.deadline) revert CampaignEnded();
        if (amount == 0) revert InvalidGoal();

        campaign.token.safeTransferFrom(msg.sender, address(this), amount);

        campaign.raised += amount;
        contributions[id][msg.sender] += amount;

        emit ContributionReceived(id, msg.sender, amount, campaign.raised);
    }

    function withdraw(uint256 id) external nonReentrant {
        Campaign storage campaign = campaigns[id];
        if (campaign.creator == address(0)) revert CampaignNotFound(id);
        if (msg.sender != campaign.creator) revert NotCreator();
        if (campaign.withdrawn) revert NothingToWithdraw();
        if (campaign.raised < campaign.goal) revert GoalNotMet();

        campaign.withdrawn = true;
        uint256 amount = campaign.raised;
        campaign.token.safeTransfer(campaign.creator, amount);

        emit Withdrawal(id, campaign.creator, amount);
    }

    function refund(uint256 id) external nonReentrant {
        Campaign storage campaign = campaigns[id];
        if (campaign.creator == address(0)) revert CampaignNotFound(id);
        if (block.timestamp <= campaign.deadline) revert PastDeadline();
        if (campaign.raised >= campaign.goal) revert GoalNotMet();

        uint256 contributed = contributions[id][msg.sender];
        if (contributed == 0) revert NoContribution();

        contributions[id][msg.sender] = 0;
        campaign.token.safeTransfer(msg.sender, contributed);

        emit Refund(id, msg.sender, contributed);
    }

    function getCampaign(uint256 id) external view returns (Campaign memory) {
        Campaign memory campaign = campaigns[id];
        if (campaign.creator == address(0)) revert CampaignNotFound(id);
        return campaign;
    }

    function contributionOf(uint256 id, address contributor) external view returns (uint256) {
        return contributions[id][contributor];
    }
}