// AI API调用工具
// 用于连接百川AI API进行智能回复生成

/**
 * 调用百川AI API获取回复
 * @param {string} userMessage - 用户输入的消息
 * @param {string} systemPrompt - 系统提示词，定义AI的行为和角色
 * @param {number} retries - 重试次数，默认为1
 * @returns {Promise<string>} - AI生成的回复
 */
async function callBaichuanAI(userMessage, systemPrompt = "你是一个健康顾问助手，专注于提供科学、准确的健康建议。", retries = 1) {
    let currentRetry = 0;
    
    while (currentRetry <= retries) {
        try {
            console.log(`尝试调用AI API [第${currentRetry + 1}次]`);
            
            // 设置请求超时
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 5秒超时
            
            const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer 69362561-5030-4509-b828-40cc66e2760c"
                },
                body: JSON.stringify({
                    "model": "doubao-1-5-thinking-pro-250415",
                    "messages": [
                        {"role": "system", "content": systemPrompt},
                        {"role": "user", "content": userMessage}
                    ]
                }),
                signal: controller.signal
            });
            
            // 清除超时计时器
            clearTimeout(timeoutId);
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(`API请求失败: ${data.error?.message || '未知错误'}`);
            }
            
            // 验证返回的数据格式
            if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
                throw new Error('API返回数据格式异常');
            }
            
            return data.choices[0].message.content;
        } catch (error) {
            console.error(`AI API调用失败 [第${currentRetry + 1}次]:`, error);
            
            // 如果已达到最大重试次数，抛出异常
            if (currentRetry >= retries) {
                throw error;
            }
            
            // 重试延迟，随重试次数增加
            const delay = 1000 * (currentRetry + 1);
            await new Promise(resolve => setTimeout(resolve, delay));
            
            currentRetry++;
        }
    }
    
    // 不应该执行到这里，但为了安全返回一个错误信息
    return "抱歉，AI服务暂时不可用，请稍后再试。";
}

// 针对不同功能的专用API调用函数

/**
 * 获取情感分析和暖心回复
 * @param {string} userMessage - 用户的心事或烦恼
 * @returns {Promise<string>} - AI生成的暖心回复
 */
async function getEmotionalSupport(userMessage) {
    const systemPrompt = "你是一个温暖、善解人意的心理支持助手。你的回复应该富有同理心，给予积极的心理支持，但不做具体的医疗建议。限制回复在100字以内，语气温暖亲切。";
    return await callBaichuanAI(userMessage, systemPrompt);
}

/**
 * 获取健康症状自检建议
 * @param {string} symptom - 用户的症状
 * @returns {Promise<string>} - AI生成的健康建议
 */
async function getSymptomsAdvice(symptom) {
    const systemPrompt = "你是一个初步健康评估助手。请根据用户提供的症状，给出一些可能的常见原因和初步建议。明确声明你不是医生，严重症状应立即就医。不要做出确定性的诊断。回复控制在150字以内。";
    return await callBaichuanAI(`我最近有${symptom}的症状，这可能是什么原因？有什么建议吗？`, systemPrompt);
}

/**
 * 获取饮食搭配建议
 * @param {Array<string>} foods - 检测到的食物列表
 * @returns {Promise<string>} - AI生成的饮食搭配建议
 */
async function getFoodAdvice(foods) {
    const foodList = foods.join("、");
    const systemPrompt = "你是一个营养学顾问。请根据用户提供的食物列表，给出营养均衡的建议和可能的搭配方案。注重科学性和实用性，建议应简洁明了。";
    return await callBaichuanAI(`我的餐盘中有${foodList}，请给我一些营养搭配建议。`, systemPrompt);
}

/**
 * 获取姿势评估反馈
 * @param {Object} postureData - 姿势评估数据
 * @returns {Promise<string>} - AI生成的姿势改善建议
 */
async function getPostureFeedback(postureData) {
    const prompt = `我的姿势数据如下：脊柱弯曲度${postureData.spineCurvature}度，颈部角度${postureData.neckAngle}度，肩部高度差${postureData.shoulderImbalance}cm。请给我一些改善姿势的建议。`;
    const systemPrompt = "你是一个人体工程学专家。请根据用户提供的姿势数据，分析可能存在的问题，并给出具体的改善建议。建议应当简洁明了，实用性强。";
    return await callBaichuanAI(prompt, systemPrompt);
}

// 导出函数供其他模块使用
export {
    callBaichuanAI,
    getEmotionalSupport,
    getSymptomsAdvice,
    getFoodAdvice,
    getPostureFeedback
}; 