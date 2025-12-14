// صبر می‌کنیم تا کل محتوای HTML بارگذاری شود
document.addEventListener("DOMContentLoaded", () => {
  displayUsers(); 
});

  const addUserBtn = document.getElementById("openFormBtn");
  const userModal = document.getElementById("userModal");
  const userForm = document.getElementById("userForm");
  const modalTitle = userModal.querySelector("h2");
  const submitButton = document.getElementById("submit");
  const closeFormBtn = document.getElementById("closeFormBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const userTableBody = document.querySelector("table tbody");

  let isEditMode = false;
  let editingUserId = null;

  const USERS_STORAGE_KEY = "users_list";
//Service Functions 6تا تابع 
  function GetData(key) {
    const data = JSON.parse(localStorage.getItem(key)) || [];
    return data;
  }

  function SaveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function GetUsers() {
    return GetData(USERS_STORAGE_KEY);
  }

  function AddUser(user) {
    const users = GetUsers();
    users.push(user);
    SaveData(USERS_STORAGE_KEY, users);
  }

  function DeleteUser(userId) {
    let users = GetUsers();
    users = users.filter(user => user.id !== userId);
    SaveData(USERS_STORAGE_KEY, users);
  }

  function UpdateUser(userId, updatedData) {
    let users = GetUsers();
    users = users.map(user => (user.id === userId ? { ...user, ...updatedData } : user));
    SaveData(USERS_STORAGE_KEY, users);
  }
//UI Functions 4تابع  مسئول نمایش و مدیریت ظاهر
  function openModal(mode, userId = null) {
    isEditMode = (mode === 'edit');
    editingUserId = userId;

    if (isEditMode) {
      modalTitle.textContent = "Edit User";
      submitButton.textContent = "Save Changes";
      const userToEdit = GetUsers().find(u => u.id === userId);
      if (userToEdit) {
        document.getElementById("fullName").value = userToEdit.fullName;
        document.getElementById("email").value = userToEdit.email;
        document.getElementById("phone").value = userToEdit.phone;
        document.getElementById("role").value = userToEdit.role;
      }
    } else {
      modalTitle.textContent = "Add New User";
      submitButton.textContent = "Add User";
      userForm.reset();
    }
    userModal.classList.remove("hidden");
  }

  function closeModal() {
    userModal.classList.add("hidden");
  }

  function displayUsers() {
    userTableBody.innerHTML = "";
    const users = GetUsers();
    updateUserCount(users.length);

    if (users.length === 0) {
      userTableBody.innerHTML = `<tr><td colspan="9" class="text-center p-4">No users found. Click 'Add User' to start.</td></tr>`;
      return;
    }

    users.forEach(user => {
      const initials = user.fullName.split(" ").map(n => n[0]).join("");
      const row = `
        <tr class="hover:bg-gray-50 [&_tr:last-child]:border-0">
          <td class="td">
            <label class="check-container">
              <input type="checkbox" />
              <span class="checkbox"></span>
            </label>
          </td>
          <td class="text-left p-4 text-sm font-light td">
            <span class="relative flex size-10 shrink-0 overflow-hidden rounded-full w-8 h-8">
              <span class="bg-[--muted] flex size-full items-center justify-center rounded-full">${initials}</span>
            </span>
          </td>
          <td class="td font-medium">${user.fullName}</td>
          <td class="td text-gray-600">${user.email}</td>
          <td class="td text-gray-600">${user.phone}</td>
          <td class="td">
            <span class="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 focus-visible:border-[--ring] focus-visible:ring-[#a1a1a1]/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden border-transparent bg-[--primary] text-[--primary-foreground] [a&]:hover:bg-[--primary]/90">
              ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </td>
          <td class="td">
            <div class="flex items-center space-x-2">
              <label class="switch">
                <input type="checkbox" checked />
                <span class="slider round"></span>
              </label>
              <span class="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 focus-visible:border-[--ring] focus-visible:ring-[#a1a1a1]/50 focus-visible:ring-[3px] dark:aria-invalid:ring-[--destructive]/40 transition-[color,box-shadow] overflow-hidden border-transparent bg-[--primary] text-[--primary-foreground] [a&]:hover:bg-[--primary]/90">
                Active
              </span>
            </div>
          </td>
          <td class="td text-gray-600">${user.lastLogin}</td>
          <td class="text-foreground h-10 px-2 align-middle font-medium whitespace-nowrap text-right">
            <div class="flex items-center justify-end space-x-2">
              <button class="edit-btn inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-[--ring] focus-visible:ring-[#a1a1a1]/50 focus-visible:ring-[3px] aria-invalid:border-[--destructive] hover:bg-[--accent] hover:text-[--accent-foreground] dark:hover:bg-[--accent]/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5" data-id="${user.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen w-4 h-4" aria-hidden="true">
                  <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path>
                </svg>
              </button>
              <button class="delete-btn inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-[--ring] focus-visible:ring-[#a1a1a1]/50 focus-visible:ring-[3px] hover:bg-[--accent] hover:text-[--accent-foreground] dark:hover:bg-[--accent]/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5" data-id="${user.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2 lucide-trash-2 w-4 h-4 text-red-500" aria-hidden="true">
                  <path d="M10 11v6"></path>
                  <path d="M14 11v6"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                  <path d="M3 6h18"></path>
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
      userTableBody.innerHTML += row;
    });
  }

  function updateUserCount(count) {
    const countElement = document.querySelector("tfoot p");
    if (countElement) {
      countElement.textContent = `Showing ${count} of ${count} users`;
    }
  }

//Event Handlers 4تابع ناشناس

  // باز کردن مودال برای افزودن
  addUserBtn.addEventListener("click", () => openModal('add'));

  // بستن مودال
  closeFormBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  userModal.addEventListener("click", e => {
    if (e.target === userModal) closeModal();
  });

// ساخت  آبجکت کاربر برای اضافه و ویرایش و پاس دادن یه توابع دیگه
  userForm.addEventListener("submit", e => {
    e.preventDefault();
    const formData = {
      fullName: document.getElementById("fullName").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      role: document.getElementById("role").value,
    };

    if (isEditMode) {
      UpdateUser(editingUserId, formData);
    } else {
      const newUser = {
        ...formData,
        id: Date.now(),
        status: "Active",
        lastLogin: new Date().toLocaleString("fa-IR"),
      };
      AddUser(newUser);
    }
    closeModal();
    displayUsers();
  });

 //برای هندل کردن دکمه های ادیت و دیلیت 
  userTableBody.addEventListener("click", e => {
    const editBtn = e.target.closest(".edit-btn");
    const deleteBtn = e.target.closest(".delete-btn");

    if (editBtn) {
      const userId = parseInt(editBtn.dataset.id);
      openModal('edit', userId);
    }

    if (deleteBtn) {
      const userId = parseInt(deleteBtn.dataset.id);
      if (confirm("Are you sure you want to delete this user?")) {
        DeleteUser(userId);
        displayUsers();
      }
    }
  });

