
const joinBtn = document.getElementById('joinBtn');

joinBtn.addEventListener('click', () => {
  const name = document.getElementById('fullName').value.trim();
  const contact = document.getElementById('contact').value.trim();
  const province = document.getElementById('province').value;
  const age = document.getElementById('age').value;
  const industry = document.getElementById('industry').value;
  const consent = document.getElementById('consent').checked;

  if(!name || !contact || !province || !age || !industry){
    alert('Please complete all fields.');
    return;
  }

  if(!consent){
    alert('Please accept the consent form.');
    return;
  }

  localStorage.setItem('forward_name', name);
  localStorage.setItem('forward_contact', contact);
  localStorage.setItem('forward_province', province);
  localStorage.setItem('forward_industry', industry);

  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('loadingScreen').classList.remove('hidden');

  setTimeout(() => {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    document.getElementById('profileName').textContent = name;
    document.getElementById('profileProvince').textContent = province;
    document.getElementById('profileIndustry').textContent = industry;
  }, 450);
});

const savedName = localStorage.getItem('forward_name');

if(savedName){
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  document.getElementById('profileName').textContent = savedName;
  document.getElementById('profileProvince').textContent = localStorage.getItem('forward_province') || '-';
  document.getElementById('profileIndustry').textContent = localStorage.getItem('forward_industry') || '-';
}

document.querySelectorAll('.navbtn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.navbtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));

    document.getElementById(btn.dataset.page).classList.add('active');
  });
});

document.querySelectorAll('.react').forEach(btn => {
  btn.addEventListener('click', () => {
    const span = btn.querySelector('span');
    let count = parseInt(span.textContent || '0', 10);

    if(btn.classList.contains('liked')){
      btn.classList.remove('liked');
      span.textContent = Math.max(0, count - 1);
    } else {
      btn.classList.add('liked');
      span.textContent = count + 1;
    }
  });
});

const adminToggle = document.getElementById('adminToggle');
if(adminToggle){
  adminToggle.addEventListener('click', () => {
    const panel = document.getElementById('adminPanel');
    panel.classList.toggle('hidden');
    adminToggle.textContent = panel.classList.contains('hidden') ? 'Open Admin Settings' : 'Close Admin Settings';
  });
}
