const { analyzeSocialFoodUrl } = require('./utils/socialImport.js');
const cases = [
  { url: 'https://www.instagram.com/reel/DWbPMk5k6Uf/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==', caption: `大遠百附近巷弄甜點控必收🍰
這家戚風蛋糕真的很可以！

抹茶草莓顏值超高🍓
外層還有大人味抹茶醬
搭配鬆軟戚風
裡面還藏藍莓醬超有驚喜感

巧克力口味也很讚🍫
搭配覆盆莓醬
苦甜中帶點果酸完全不膩

🏬 店名：貳參咖啡-西門店
📍 地址：300新竹市北區西門街152號
#新竹美食 #甜點 #戚風蛋糕 #甜點控` },
  { url: 'https://www.instagram.com/reel/DYHqpT-SGme/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==', caption: `˚₊୧⃛｜貓島廚房｜୨⃛₊˚
#媛子吃台南 ·台南氛圍超好吃義大利麵

˖◛⁺威士忌醬油菇菇溫泉蛋豬肉末義大利麵 $250
˖◛⁺冬陰功（泰式酸辣蝦）義大利麵 $330
˖◛⁺老奶奶焦糖蘋果派佐冰淇淋 $170

✧ 貓島廚房 ✧ @isleofcatskitchen 
📍地址｜臺南市北區長興里長北街157號
#台南約會餐廳 #台南探店 #貓島廚房 #台南義大利麵 #約會` },
];
(async () => {
  for (const item of cases) {
    const r = await analyzeSocialFoodUrl(item.url, item.caption);
    console.log(JSON.stringify({ name: r.name, city: r.city, district: r.district, address: r.address, signatureFood: r.signatureFood, tags: r.tags, daily: r.aiDailyMealTags, cuisine: r.aiCuisineTags, missing: r.missingFields, sourceCaptionLength: r.sourceCaption?.length }, null, 2));
  }
})();
