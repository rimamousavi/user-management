document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://jsonplaceholder.typicode.com/users";
 
  const userService = new UserService(API_URL);

  new App(userService);
});
class UserService {

  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }


  async getUsers() {
    try {
      const response = await fetch(this.apiUrl); // 1. درخواست را به سرور بفرست
      const users = await response.json(); // 2. جواب را به فرمت JSON تبدیل کن
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      return []; // در صورت خطا، یک آرایه خالی برگردان
    }
  }

  // متد برای افزودن کاربر جدید به سرور
  async addUser(user) {
    try {
      await fetch(this.apiUrl, {
        method: 'POST', // نوع درخواست
        headers: {
          'Content-Type': 'application/json', // به سرور میگوییم که داریم JSON می‌فرستیم
        },
        body: JSON.stringify(user), // آبجکت کاربر را به متن JSON تبدیل کن
      });
    } catch (error) {
      console.error("Error adding user:", error);
    }
  }

  // متد برای حذف کاربر از سرور
  async deleteUser(userId) {
    try {
      await fetch(`${this.apiUrl}/${userId}`, {
        method: 'DELETE', // نوع درخواست
      });
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }

  // متد برای آپدیت کاربر در سرور
  async updateUser(userId, updatedData) {
    try {
      await fetch(`${this.apiUrl}/${userId}`, {
        method: 'PUT', // یا 'PATCH'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }
  
  // متد برای پیدا کردن یک کاربر
  async findUserById(userId) {
    try {
      const response = await fetch(`${this.apiUrl}/${userId}`);
      const user = await response.json();
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }
}

class App {
  constructor(userService) {
    this.userService = userService; 

    this.isEditMode = false;
    this.editingUserId = null;

    this._initDOMElements();
    this._initEventListeners();

    this.displayUsers(); 
  }


  _initDOMElements() {
    this.addUserBtn = document.getElementById("openFormBtn");
    this.userModal = document.getElementById("userModal");
    this.userForm = document.getElementById("userForm");
    this.modalTitle = this.userModal.querySelector("h2");
    this.submitButton = document.getElementById("submit");
    this.closeFormBtn = document.getElementById("closeFormBtn");
    this.cancelBtn = document.getElementById("cancelBtn");
    this.userTableBody = document.querySelector("table tbody");
  }

  // متد خصوصی برای اتصال Event Listener ها
  _initEventListeners() {
    this.addUserBtn.addEventListener("click", () => this.openModal('add'));
    this.closeFormBtn.addEventListener("click", () => this.closeModal());
    this.cancelBtn.addEventListener("click", () => this.closeModal());
    this.userModal.addEventListener("click", e => {
      if (e.target === this.userModal) this.closeModal();
    });

    this.userForm.addEventListener("submit", e => this.handleFormSubmit(e));
    this.userTableBody.addEventListener("click", e => this.handleTableClick(e));
  }

  // --- متدهای UI ---
  async openModal(mode, userId = null) {
    this.isEditMode = (mode === 'edit');
    this.editingUserId = userId;

    if (this.isEditMode) {
      this.modalTitle.textContent = "Edit User";
      this.submitButton.textContent = "Save Changes";

      const userToEdit = await this.userService.findUserById(userId);
      
      if (userToEdit) {

        document.getElementById("fullName").value = userToEdit.name; 
        document.getElementById("email").value = userToEdit.email;
        document.getElementById("phone").value = userToEdit.phone;
        document.getElementById("role").value = userToEdit.company.name; 
      }
    } else {
      this.modalTitle.textContent = "Add New User";
      this.submitButton.textContent = "Add User";
      this.userForm.reset();
    }
    this.userModal.classList.remove("hidden");
}

  closeModal() {
    this.userModal.classList.add("hidden");
  }

  updateUserCount(count) {
    const countElement = document.querySelector("tfoot p");
    if (countElement) {
      countElement.textContent = `Showing ${count} of ${count} users`;
    }
  }

   async displayUsers () {
    this.userTableBody.innerHTML = "";
     const users = await this.userService.getUsers();
    this.updateUserCount(users.length);

    if (users.length === 0) {
      this.userTableBody.innerHTML = `<tr><td colspan="9" class="text-center p-4">No users found. Click 'Add User' to start.</td></tr>`;
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
          <td class="td font-medium">${user.name}</td>
          <td class="td text-gray-600">${user.email}</td>
          <td class="td text-gray-600">${user.phone}</td>
          <td class="td">
            <span class="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 focus-visible:border-[--ring] focus-visible:ring-[#a1a1a1]/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden border-transparent bg-[--primary] text-[--primary-foreground] [a&]:hover:bg-[--primary]/90">
              ${user.company.name.charAt(0).toUpperCase() + user.company.name.slice(1)}
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
          <td class="td text-gray-600">${new Date().toLocaleDateString('fa-IR')}</td>
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
      this.userTableBody.innerHTML += row;
    });
  }

  // --- متدهای مدیریت رویداد ---
  async handleFormSubmit(event) {
    event.preventDefault();
    const formData = {
      fullName: document.getElementById("fullName").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      role: document.getElementById("role").value,
    };

    if (this.isEditMode) {
      this.userService.updateUser(this.editingUserId, formData);
    } else {
      const newUser = {
        ...formData,
        id: Date.now(),
        status: "Active",
        lastLogin: new Date().toLocaleString("fa-IR"),
      };
      this.userService.addUser(newUser);
    }
    this.closeModal();
    this.displayUsers();
  }

  async handleTableClick(event) {
    const editBtn = event.target.closest(".edit-btn");
    const deleteBtn = event.target.closest(".delete-btn");

    if (editBtn) {
      const userId = parseInt(editBtn.dataset.id);
      this.openModal('edit', userId);
    }
    if (deleteBtn) {
      const userId = parseInt(deleteBtn.dataset.id);
      if (confirm("Are you sure you want to delete this user?")) {
         await this.userService.deleteUser(userId)
        await this.displayUsers();
      }
    }
  }
}



