// Move the hero background at half scroll speed to create the parallax depth effect
const heroBg = document.getElementById('heroBg');

window.addEventListener('scroll', () => {
  heroBg.style.transform = `translateY(${window.scrollY * 0.5}px)`;
});
