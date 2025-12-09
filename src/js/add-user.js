
document.addEventListener('DOMContentLoaded',function(){
    const userForm=document.getElementById('userForm');
    const userModal=document.getElementById('userModal');
    const openFormBtn=document.getElementById('openFormBtn');
    const closeFormBtn=document.getElementById('closeFormBtn');
    const cancelBtn=document.getElementById('cancelBtn');

    openFormBtn.addEventListener('click',function(){
        userModal.classList.remove('hidden');
    })
    function closeModal(){
        userModal.classList.add('hidden');
        userForm.reset();
    }
    cancelBtn.addEventListener('click',closeModal);
    closeFormBtn.addEventListener('click',closeModal);

    userModal.addEventListener('click',function(e){
        if(e.target===userModal){
            closeModal();
        }
    })
});
