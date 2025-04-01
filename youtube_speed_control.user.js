// ==UserScript==
// @name         YouTube/B站播放速度控制
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  在YouTube和B站视频播放页面上按键+增加播放速度，按键-减小播放速度
// @author       Leen
// @match        https://www.youtube.com/watch*
// @match        https://www.bilibili.com/video/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // 配置参数
    const config = {
        speedIncrement: 0.25, // 每次增加/减少的速度值
        minSpeed: 0.25, // 最小播放速度
        maxSpeed: 5.0, // 最大播放速度
        showNotification: true, // 是否显示速度变化通知
        notificationDuration: 1000 // 通知显示时间（毫秒）
    };

    // 创建通知元素
    let notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 70px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        font-size: 16px;
        font-weight: bold;
        z-index: 9999;
        display: none;
        transition: opacity 0.3s;
    `;
    document.body.appendChild(notification);

    // 显示通知
    function showNotification(message) {
        if (!config.showNotification) return;

        notification.textContent = message;
        notification.style.display = 'block';
        notification.style.opacity = '1';

        // 设置定时器，自动隐藏通知
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }, config.notificationDuration);
    }

    // 获取当前视频元素
    function getVideoElement() {
        // YouTube视频选择器
        const youtubeVideo = document.querySelector('video.html5-main-video');
        if (youtubeVideo) return youtubeVideo;
        
        // B站视频选择器
        const bilibiliVideo = document.querySelector('video.bilibili-player-video') 
                            || document.querySelector('.bpx-player-video-wrap video');
        return bilibiliVideo;
    }

    // 改变播放速度
    function changePlaybackSpeed(delta) {
        const video = getVideoElement();
        if (!video) return;

        let newSpeed = Math.round((video.playbackRate + delta) * 100) / 100;
        newSpeed = Math.max(config.minSpeed, Math.min(config.maxSpeed, newSpeed));

        video.playbackRate = newSpeed;
        showNotification(`播放速度: ${newSpeed.toFixed(2)}x`);
    }

    // 键盘事件监听
    document.addEventListener('keydown', function (event) {
        // 忽略在输入框中的按键事件
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) {
            return;
        }

        // 按键 + 增加速度
        if (event.key === '+' || event.key === '=') {
            changePlaybackSpeed(config.speedIncrement);
            event.preventDefault();
        }
        // 按键 - 减小速度
        else if (event.key === '-' || event.key === '_') {
            changePlaybackSpeed(-config.speedIncrement);
            event.preventDefault();
        }
    });

    // 初始化通知
    function init() {
        const video = getVideoElement();
        if (video) {
            showNotification(`当前播放速度: ${video.playbackRate.toFixed(2)}x`);
        } else {
            // 如果视频元素还没加载，稍后再试
            setTimeout(init, 1000);
        }
    }

    // 页面加载完成后初始化
    // window.addEventListener('load', init);

    // 也可以立即尝试初始化，以防页面已经加载
    // setTimeout(init, 1500);

    console.log('播放速度控制脚本已加载');
})();
