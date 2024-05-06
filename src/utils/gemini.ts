import config from '@/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const assistantAttributePrompt =
    'You are a helpful assistant. You are familiar with Solidity. You will be provided with slither issues description. You will have to respond back with human explanation of the solidity issues description. It should be very clear information providing brief about the issue. The description will also contain code snippets which will give better understanding of issue. Also you should not change the context of issue. Human readable description should be between 20-35 words.';

const genAI = new GoogleGenerativeAI(config.goolgeApiKey as string);

async function gemini(
    chatText = 'Reentrancy in StakingContract.unstake(uint256) : External calls: - safeRewardTransfer(msg.sender,pendingReward) - returndata = address(token).functionCall(data,SafeERC20: low-level call failed) - exntToken.safeTransfer(to,amount) - (success,returndata) = target.call{value: value}(data) External calls sending eth: - safeRewardTransfer(msg.sender,pendingReward) - (success,returndata) = target.call{value: value}(data) State variables written after the call(s): - userInfo[msg.sender].amount -= amount StakingContract.userInfo can be used in cross function reentrancies: - StakingContract.getPendingReward() - StakingContract.stake(uint256) - StakingContract.unstake(uint256) - StakingContract.userInfo - userInfo[msg.sender].rewardDebt = (userInfo[msg.sender].amount * accRewardPerShare / 1e16) StakingContract.userInfo can be used in cross function reentrancies: - StakingContract.getPendingReward() StakingContract.stake(uint256) - StakingContract.unstake(uint256) - StakingContract.userInfo',
) {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `${assistantAttributePrompt}
   --------------------------------
   ${chatText}
   `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
}

export default gemini;
