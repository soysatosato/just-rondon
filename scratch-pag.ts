// ページが実際に渡している filters を再現して、返る totalCount を見る
const filters = {
  sort: null, rec: null, mustSee: false, kids: false, free: false, categories: [] as string[],
};
console.log("page が渡す filters のキー数:", Object.keys(filters).length, Object.keys(filters));
const page = 1;
console.log("totalCount を取る条件 (page===1 && キー数===0):", page === 1 && Object.keys(filters).length === 0);
