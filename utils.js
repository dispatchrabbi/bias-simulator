export function sum(nums) {
  return nums.reduce((total, num) => total + num, 0);
}

export function average(nums) {
  return sum(nums) / nums.length;
}
