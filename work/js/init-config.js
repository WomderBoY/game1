// 关卡配置初始化脚本
// 这个文件用于在无法使用fetch加载JSON文件时，直接提供关卡配置

const DEFAULT_LEVELS_CONFIG = {
    "levels": [
        {
            "id": "test_1",
            "file": "../map/test_1.json",
            "name": "测试关卡1",
            "unlocked": true,
            "order": 1
        },
        {
            "id": "test_2", 
            "file": "../map/test_2.json",
            "name": "测试关卡2",
            "unlocked": false,
            "order": 2
        },
        {
            "id": "jiaoxue1", 
            "file": "../map/jiaoxue1.json",
            "name": "教学关卡1",
            "unlocked": false,
            "order": 3
        },
        {
            "id": "bg_map1",
            "file": "../map/bg-map1.json", 
            "name": "第一关",
            "unlocked": false,
            "order": 4
        },
        {
            "id": "bg_map2",
            "file": "../map/bg-map2.json",
            "name": "第二关", 
            "unlocked": false,
            "order": 5
        },
        {
            "id": "bg_map3",
            "file": "../map/bg-map3.json",
            "name": "第三关",
            "unlocked": false, 
            "order": 6
        },
        {
            "id": "bg_map4",
            "file": "../map/bg-map4.json",
            "name": "第四关",
            "unlocked": false,
            "order": 7
        }
    ],
    "defaultUnlocked": ["test_1"],
    "version": "1.0"
};

// 将配置保存到localStorage
localStorage.setItem('levelsConfig', JSON.stringify(DEFAULT_LEVELS_CONFIG));

console.log('关卡配置已初始化并保存到localStorage');
console.log('配置内容:', DEFAULT_LEVELS_CONFIG);
