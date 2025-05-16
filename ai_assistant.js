// 虚拟助手功能
// 基于百川AI，提供语音交互和问答功能

import { callBaichuanAI } from './ai_api.js';

/**
 * 处理用户提问并获取AI回复
 * @param {string} userQuestion - 用户提问
 * @returns {Promise<string>} - AI回复
 */
export async function askAssistant(userQuestion) {
    const systemPrompt = "你是一个健康生活助手，可以回答用户关于健康、饮食、运动、生活方式等方面的问题。回答应当友好、简洁且科学准确。控制回复在200字以内。";
    return callBaichuanAI(userQuestion, systemPrompt);
}

/**
 * 获取个性化饮食推荐
 * @param {Object} userProfile - 用户的基本信息(身高、体重、年龄、性别、活动水平等)
 * @returns {Promise<string>} - AI生成的饮食推荐
 */
export async function getDietRecommendation(userProfile = {}) {
    const defaultProfile = {
        height: 170,
        weight: 60,
        age: 25,
        gender: '男',
        activityLevel: '中等',
        ...userProfile
    };
    
    const prompt = `请根据以下用户信息，给出今日的饮食推荐计划：
    身高: ${defaultProfile.height}cm
    体重: ${defaultProfile.weight}kg
    年龄: ${defaultProfile.age}岁
    性别: ${defaultProfile.gender}
    活动水平: ${defaultProfile.activityLevel}`;
    
    const systemPrompt = "你是一名专业营养师，擅长根据用户的身体情况提供科学的饮食建议。建议应当包括一日三餐的合理搭配，注重营养均衡。回复应简洁明了，控制在200字以内。";
    
    return callBaichuanAI(prompt, systemPrompt);
}

/**
 * 获取个性化运动推荐
 * @param {Object} userProfile - 用户的基本信息(身高、体重、年龄、性别、活动水平等)
 * @returns {Promise<string>} - AI生成的运动推荐
 */
export async function getExerciseRecommendation(userProfile = {}) {
    const defaultProfile = {
        height: 170,
        weight: 60,
        age: 25,
        gender: '男',
        activityLevel: '中等',
        preferredExercise: '无特殊偏好',
        ...userProfile
    };
    
    const prompt = `请根据以下用户信息，给出今日的运动建议：
    身高: ${defaultProfile.height}cm
    体重: ${defaultProfile.weight}kg
    年龄: ${defaultProfile.age}岁
    性别: ${defaultProfile.gender}
    活动水平: ${defaultProfile.activityLevel}
    运动偏好: ${defaultProfile.preferredExercise}`;
    
    const systemPrompt = "你是一名专业健身教练，擅长根据用户的身体情况提供科学的运动建议。建议应当包括运动类型、时长和强度。考虑用户的活动水平和运动偏好，给出合理且可行的建议。回复应简洁明了，控制在200字以内。";
    
    return callBaichuanAI(prompt, systemPrompt);
}

// 语音识别相关功能
let recognition = null;
let isRecording = false;

/**
 * 初始化语音识别功能
 * @param {Function} onResultCallback - 识别结果的回调函数
 * @param {Function} onEndCallback - 识别结束的回调函数
 * @returns {boolean} - 是否成功初始化
 */
export function initSpeechRecognition(onResultCallback, onEndCallback) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.error('浏览器不支持语音识别功能');
        return false;
    }
    
    try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'zh-CN';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onResultCallback(transcript);
        };
        
        recognition.onend = () => {
            isRecording = false;
            onEndCallback();
        };
        
        return true;
    } catch (error) {
        console.error('初始化语音识别失败:', error);
        return false;
    }
}

/**
 * 开始语音识别
 * @returns {boolean} - 是否成功开始识别
 */
export function startSpeechRecognition() {
    if (!recognition) {
        console.error('语音识别未初始化');
        return false;
    }
    
    try {
        recognition.start();
        isRecording = true;
        return true;
    } catch (error) {
        console.error('开始语音识别失败:', error);
        return false;
    }
}

/**
 * 停止语音识别
 */
export function stopSpeechRecognition() {
    if (recognition && isRecording) {
        recognition.stop();
        isRecording = false;
    }
}

/**
 * 检查语音识别状态
 * @returns {boolean} - 是否正在录音
 */
export function isRecordingActive() {
    return isRecording;
} 