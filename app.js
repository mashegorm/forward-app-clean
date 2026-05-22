
const joinBtn = document.getElementById('joinBtn');
const platform = document.getElementById('platform');

joinBtn.addEventListener('click', () => {
  const name = document.getElementById('nameInput').value.trim();
  const contact = document.getElementById('contactInput').value.trim();

  if(!name || !contact){
    alert('Please enter your details.');
    return;
  }

  localStorage.setItem('forward_name', name);
  localStorage.setItem('forward_contact', contact);

  document.getElementById('profileName').textContent = name;

  platform.classList.remove('hidden');

  window.scrollTo({
    top: platform.offsetTop,
    behavior: 'smooth'
  });
});

const savedName = localStorage.getItem('forward_name');

if(savedName){
  document.getElementById('profileName').textContent = savedName;
  platform.classList.remove('hidden');
}
