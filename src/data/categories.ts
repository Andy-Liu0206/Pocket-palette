export const categoryGroups = [
  {
    title: '日常餐食',
    tags: ['早午餐', '午餐', '晚餐', '宵夜', '便當', '下午茶'],
  },
  {
    title: '料理種類',
    tags: ['台式', '日式', '燒肉', '韓式', '拉麵', '火鍋', '牛排', '素食', '港式', '健康餐', '泰式', '義式', '咖啡廳', '飲料'],
  },
  {
    title: '情境',
    tags: ['小吃', '點心', '甜點', '聚餐', '約會'],
  },
] as const;

export const allTags = categoryGroups.flatMap((group) => group.tags);
