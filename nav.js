/* ================================================================
   nav.js — ナビゲーション（スクロール追従・ハンバーガーメニュー）
   ================================================================ */

/* ---- NAVBAR SCROLL ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ---- HAMBURGER ---- */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks= document.querySelectorAll('.mobile-link');

function openMenu()  { mobileMenu.classList.add('open');    hamburger.classList.add('active'); }
function closeMenu() { mobileMenu.classList.remove('open'); hamburger.classList.remove('active'); }

hamburger.addEventListener('click', () => mobileMenu.classList.contains('open') ? closeMenu() : openMenu());
mobileLinks.forEach(l => l.addEventListener('click', closeMenu));
