/* App logic for upgraded XShare - Vanilla JS */
/* Utilities */
function $(s){ return document.querySelector(s); }
function $all(s){ return Array.from(document.querySelectorAll(s)); }

/* Toast helper */
function showToast(message, type='primary', timeout=2500){
  const container = document.getElementById('toastContainer') || document.body;
  const toastId = 't'+Date.now();
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${type} border-0 show`;
  toast.id = toastId;
  toast.setAttribute('role','alert');
  toast.setAttribute('aria-live','assertive');
  toast.setAttribute('aria-atomic','true');
  toast.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
  if(document.getElementById('toastContainer')) document.getElementById('toastContainer').appendChild(toast);
  else{ document.body.appendChild(toast); toast.style.position='fixed'; toast.style.top='10px'; toast.style.right='10px'; toast.style.zIndex=2000; }
  setTimeout(()=> { try{ toast.remove(); }catch(e){} }, timeout);
}

/* LocalStorage keys */
const LS_USERS = 'xshare_users';
const LS_CURRENT = 'xshare_current_user';
const LS_POSTS = 'xshare_posts';
const LS_DARK = 'xshare_darkmode';

/* Seed data if none */
function seed(){
  if(!localStorage.getItem(LS_USERS)){
    const users=[
      {name:'John Doe',email:'john@example.com',password:'123456'},
      {name:'Jane Smith',email:'jane@example.com',password:'pass123'}
    ];
    localStorage.setItem(LS_USERS,JSON.stringify(users));
  }
  if(!localStorage.getItem(LS_POSTS)){
    const posts=[
      {id:1,title:'UI Design Project',desc:'Converted Figma to responsive HTML/CSS',author:'John Doe',img:'assets/dashboard1.png',ts:Date.now()-86400000},
      {id:2,title:'Data Analysis Report',desc:'Sales dataset insights with charts',author:'Jane Smith',img:'assets/dashboard2.png',ts:Date.now()-43200000},
      {id:3,title:'Frontend App',desc:'Vanilla JS + Bootstrap project',author:'John Doe',img:'assets/dashboard3.png',ts:Date.now()-20000000}
    ];
    localStorage.setItem(LS_POSTS,JSON.stringify(posts));
  }
  if(!localStorage.getItem(LS_DARK)){
    localStorage.setItem(LS_DARK,'false');
  }
}

/* Authentication */
// Signup handling with redirect
const signupForm = document.getElementById("signupForm");
signupForm?.addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  // Save to localStorage
  localStorage.setItem("xshareUser", JSON.stringify({ name, email, password }));

  // Show spinner & message
  document.getElementById("signupText").innerText = "Creating account...";
  document.getElementById("spinner").classList.remove("d-none");

  // Redirect to welcome.html instead of dashboard.html
  setTimeout(() => {
    window.location.href = "welcome.html";
  }, 1500);
});


function loginHandler(){
  const form = document.getElementById('loginForm'); if(!form) return;
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const email = $('#loginEmail').value.trim().toLowerCase();
    const pass = $('#loginPassword').value;
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const u = users.find(x=>x.email===email && x.password===pass);
    if(!u){ showToast('Invalid credentials','danger'); return; }
    localStorage.setItem(LS_CURRENT, email);
    showToast('Logged in successfully','success');
    setTimeout(()=> location.href='welcome.html',500);
  });
}

/* Logout from multiple pages */
function attachLogout(btnId){
  const b = document.getElementById(btnId); if(!b) return;
  b.addEventListener('click', ()=>{
    localStorage.removeItem(LS_CURRENT);
    showToast('Logged out','info');
    setTimeout(()=> location.href='index.html',500);
  });
}

/* Dark mode */
function initDarkMode(){
  const pref = localStorage.getItem(LS_DARK) === 'true';
  if(pref) document.body.classList.add('dark-mode');
  const toggle = document.getElementById('darkToggle');
  if(toggle) toggle.addEventListener('click', ()=>{
    document.body.classList.toggle('dark-mode');
    localStorage.setItem(LS_DARK, document.body.classList.contains('dark-mode'));
  });
}

/* Posts rendering */
function renderPosts(list, containerId='postsContainer'){
  const container = document.getElementById(containerId); if(!container) return;
  container.innerHTML='';
  if(!list.length){ container.innerHTML='<div class="col-12 text-center text-muted">No posts found.</div>'; return; }
  list.forEach(p=>{
    const col = document.createElement('div'); col.className='col-md-4 mb-4';
    col.innerHTML = `
      <div class="card shadow-sm h-100">
        <img src="${p.img || 'assets/dashboard1.png'}" class="card-img-top" alt="cover">
        <div class="card-body d-flex flex-column">
          <div class="mb-2"><small class="text-muted">${new Date(p.ts).toLocaleString()}</small></div>
          <h5 class="post-title">${p.title}</h5>
          <p class="flex-grow-1">${p.desc}</p>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <small class="text-muted">By ${p.author}</small>
            <button class="btn btn-sm btn-outline-primary" onclick="viewPost(${p.id})">View</button>
          </div>
        </div>
      </div>`;
    container.appendChild(col);
  });
}

/* View post - simple modal */
function viewPost(id){
  const posts = JSON.parse(localStorage.getItem(LS_POSTS) || '[]');
  const p = posts.find(x=>x.id===id);
  if(!p) return showToast('Post not found','warning');
  const html = `
    <div class="modal fade" id="postModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${p.title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <img src="${p.img}" class="img-fluid mb-3" alt="img">
            <p>${p.desc}</p>
            <p class="text-muted">By ${p.author} • ${new Date(p.ts).toLocaleString()}</p>
          </div>
          <div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Close</button></div>
        </div>
      </div>
    </div>`;
  const div = document.createElement('div'); div.innerHTML = html; document.body.appendChild(div);
  const modal = new bootstrap.Modal(document.getElementById('postModal')); modal.show();
  document.getElementById('postModal').addEventListener('hidden.bs.modal', ()=>{ div.remove(); });
}

/* Dashboard logic (search, filters) */
function dashboardInit(){
  const loading = document.getElementById('loading');
  const posts = JSON.parse(localStorage.getItem(LS_POSTS) || '[]');
  // populate authors in filter
  const authors = [...new Set(posts.map(p=>p.author))].sort();
  const select = document.getElementById('filterAuthor');
  if(select){
    select.innerHTML = '<option value="">All authors</option>' + authors.map(a=>`<option value="${a}">${a}</option>`).join('');
    select.addEventListener('change', ()=> applyFilters());
  }
  // search input
  const search = document.getElementById('searchInput');
  if(search) search.addEventListener('input', ()=> applyFilters());
  // logout btns
  attachLogout('logoutBtn'); attachLogout('logoutBtn2'); attachLogout('logoutBtn3');
  initDarkMode();
  // simulate loading
  if(loading) loading.classList.remove('d-none');
  setTimeout(()=>{
    if(loading) loading.classList.add('d-none');
    renderPosts(posts);
  }, 600);
}

function applyFilters(){
  const posts = JSON.parse(localStorage.getItem(LS_POSTS) || '[]');
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const author = document.getElementById('filterAuthor')?.value || '';
  let filtered = posts.filter(p => (p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.author.toLowerCase().includes(q)));
  if(author) filtered = filtered.filter(p=>p.author===author);
  renderPosts(filtered);
}

/* Upload logic */
function uploadInit(){
  const form = document.getElementById('uploadForm'); if(!form) return;
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const title = document.getElementById('postTitle').value.trim();
    const desc = document.getElementById('postDesc').value.trim();
    const file = document.getElementById('postImage').files[0];
    const posts = JSON.parse(localStorage.getItem(LS_POSTS) || '[]');
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const currentEmail = localStorage.getItem(LS_CURRENT);
    const current = users.find(u=>u.email===currentEmail) || users[0] || {name:'Guest',email:''};
    const id = posts.reduce((m,x)=>Math.max(m,x.id||0),0)+1;
    const img = file ? URL.createObjectURL(file) : 'assets/dashboard1.png';
    posts.unshift({id,title,desc,author:current.name,img,ts:Date.now()});
    localStorage.setItem(LS_POSTS, JSON.stringify(posts));
    showToast('Post published','success');
    setTimeout(()=> location.href='dashboard.html',700);
  });
  attachLogout('logoutBtn2'); attachLogout('logoutBtn'); attachLogout('logoutBtn3');
  initDarkMode();
}

/* Profile logic */
function profileInit(){
  initDarkMode();
  attachLogout('logoutBtn3');
  const email = localStorage.getItem(LS_CURRENT);
  const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
  const current = users.find(u=>u.email===email) || null;
  if(current){
    $('#profileName').textContent = current.name;
    $('#profileEmail').textContent = current.email;
  } else {
    $('#profileName').textContent = 'Guest';
    $('#profileEmail').textContent = 'guest@xshare.local';
  }
  const posts = JSON.parse(localStorage.getItem(LS_POSTS) || '[]');
  const mine = posts.filter(p=>p.author=== (current? current.name : 'Guest'));
  renderPosts(mine, 'userPosts');
}

/* Page initializer */
function initPage(){
  seed();
  signupHandler();
  loginHandler();
  // page-specific inits
  if(document.getElementById('postsContainer')) dashboardInit();
  if(document.getElementById('uploadForm')) uploadInit();
  if(document.getElementById('userPosts')) profileInit();
  if(localStorage.getItem(LS_DARK)==='true') document.body.classList.add('dark-mode');
}

document.addEventListener('DOMContentLoaded', initPage);
