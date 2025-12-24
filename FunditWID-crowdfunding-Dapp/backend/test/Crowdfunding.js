const { expect } = require("chai");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

async function deployCrowdfundingFixture() {
  const [creator, contributor, other] = await ethers.getSigners();

  const MockToken = await ethers.getContractFactory("MockToken");
  const initialSupply = ethers.parseEther("1000");
  const token = await MockToken.deploy(initialSupply);

  const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await Crowdfunding.deploy(token.target);

  return { creator, contributor, other, token, crowdfunding };
}

describe("Crowdfunding", function () {
  describe("campaign lifecycle", function () {
    it("creates campaigns and tracks contributions", async function () {
      const { creator, contributor, token, crowdfunding } = await loadFixture(
        deployCrowdfundingFixture
      );

      const goal = ethers.parseEther("100");
      const duration = 3600;

      const tx = await crowdfunding
        .connect(creator)
        .createCampaign(goal, duration, "Public park");
      const receipt = await tx.wait();
      const event = receipt.logs.find((log) => log.fragment?.name === "CampaignCreated");
      const campaignId = event.args.id;

      await token.connect(creator).transfer(contributor.address, ethers.parseEther("50"));
      await token.connect(contributor).approve(crowdfunding.target, ethers.parseEther("50"));

      await expect(crowdfunding.connect(contributor).contribute(campaignId, ethers.parseEther("50")))
        .to.emit(crowdfunding, "ContributionReceived")
        .withArgs(campaignId, contributor.address, ethers.parseEther("50"), ethers.parseEther("50"));

      const stored = await crowdfunding.getCampaign(campaignId);
      expect(stored.raised).to.equal(ethers.parseEther("50"));
      expect(await crowdfunding.contributionOf(campaignId, contributor.address)).to.equal(
        ethers.parseEther("50")
      );
    });

    it("allows creator withdrawal once goal met", async function () {
      const { creator, contributor, token, crowdfunding } = await loadFixture(
        deployCrowdfundingFixture
      );

      const goal = ethers.parseEther("25");
      const duration = 3600;
      const createTx = await crowdfunding
        .connect(creator)
        .createCampaign(goal, duration, "Library books");
      const campaignId = (await createTx.wait()).logs[0].args.id;

      await token.connect(creator).transfer(contributor.address, ethers.parseEther("30"));
      await token.connect(contributor).approve(crowdfunding.target, ethers.parseEther("30"));
      await crowdfunding.connect(contributor).contribute(campaignId, ethers.parseEther("30"));

      const creatorBalanceBefore = await token.balanceOf(creator.address);
      await expect(crowdfunding.connect(creator).withdraw(campaignId))
        .to.emit(crowdfunding, "Withdrawal")
        .withArgs(campaignId, creator.address, ethers.parseEther("30"));
      const creatorBalanceAfter = await token.balanceOf(creator.address);

      expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(ethers.parseEther("30"));
    });

    it("refunds contributors after failed campaign", async function () {
      const { creator, contributor, token, crowdfunding } = await loadFixture(
        deployCrowdfundingFixture
      );

      const goal = ethers.parseEther("100");
      const duration = 100;
      const createTx = await crowdfunding
        .connect(creator)
        .createCampaign(goal, duration, "Community art");
      const campaignId = (await createTx.wait()).logs[0].args.id;

      await token.connect(creator).transfer(contributor.address, ethers.parseEther("40"));
      await token.connect(contributor).approve(crowdfunding.target, ethers.parseEther("40"));
      await crowdfunding.connect(contributor).contribute(campaignId, ethers.parseEther("40"));

      await time.increase(duration + 1);

      const balanceBefore = await token.balanceOf(contributor.address);
      await expect(crowdfunding.connect(contributor).refund(campaignId))
        .to.emit(crowdfunding, "Refund")
        .withArgs(campaignId, contributor.address, ethers.parseEther("40"));
      const balanceAfter = await token.balanceOf(contributor.address);

      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("40"));
    });
  });
});