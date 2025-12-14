document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://693e775f12c964ee6b6d71d4.mockapi.io/api/v1/users";

  const userService = new UserService(API_URL);

  new App(userService);
});

class UserService {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async getUsers(page = 1, limit = 5) {
    try {
      const response = await fetch(
        `${this.apiUrl}?page=${page}&limit=${limit}`
      );
      console.error("user loaded");
      return await response.json();
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }

  async findUserById(userId) {
    try {
      const response = await fetch(`${this.apiUrl}/${userId}`);
      const jsonResponse = await response.json();
      return jsonResponse;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }

  async addUser(userData) {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(userData),
      });
      console.log("User added successfully to mockapi.io");
      return await response.json();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  }

  async updateUser(userId, userData) {
    try {
      const response = await fetch(`${this.apiUrl}/${userId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(userData),
      });
      console.log("User updated successfully on mockapi.io");
      return await response.json();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }

  async deleteUser(userId) {
    try {
      const response = await fetch(`${this.apiUrl}/${userId}`, {
        method: "DELETE",
      });

      if (response.status === 204) {
        console.log("User deleted successfully on mockapi.io");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
}

class App {
  constructor(userService) {
    this.userService = userService;

    this.currentPage = 1;
    this.itemsPerPage = 5;
    this.totalUsers = 0;

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

    this.prevBtn = document.getElementById("prev-btn");
    this.nextBtn = document.getElementById("next-btn");
    this.pageButtonsContainer = document.getElementById(
      "page-buttons-container"
    );
    this.paginationSummary = document.getElementById("pagination-summary");
  }

  _initEventListeners() {
    this.addUserBtn.addEventListener("click", () => this.openModal("add"));
    this.closeFormBtn.addEventListener("click", () => this.closeModal());
    this.cancelBtn.addEventListener("click", () => this.closeModal());
    this.userModal.addEventListener("click", (e) => {
      if (e.target === this.userModal) this.closeModal();
    });

    this.userForm.addEventListener("submit", (e) => this.handleFormSubmit(e));
    this.userTableBody.addEventListener("click", (e) =>
      this.handleTableClick(e)
    );
    this.prevBtn.addEventListener("click", () => this.goToPrevPage());
    this.nextBtn.addEventListener("click", () => this.goToNextPage());
    this.pageButtonsContainer.addEventListener("click", (e) =>
      this.handlePageNumberClick(e)
    );
  }

  // --- متدهای UI ---
  async openModal(mode, userId = null) {
    this.isEditMode = mode === "edit";
    this.editingUserId = userId;

    if (this.isEditMode) {
      this.modalTitle.textContent = "Edit User";
      this.submitButton.textContent = "Save Changes";

      const userToEdit = await this.userService.findUserById(userId);

      if (userToEdit) {
        document.getElementById("fullName").value = userToEdit.name;
        document.getElementById("email").value = userToEdit.email;
        document.getElementById("phone").value = userToEdit.phone;
        document.getElementById("role").value = userToEdit.role;
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

  async displayUsers() {
    this.userTableBody.innerHTML = `<tr><td colspan="9" class="text-center p-4">Loading...</td></tr>`;
    const users = await this.userService.getUsers(
      this.currentPage,
      this.itemsPerPage
    );
    this.userTableBody.innerHTML = "";

    if (this.pageInfo) this.pageInfo.textContent = `Page ${this.currentPage}`;
    if (this.prevBtn) this.prevBtn.disabled = this.currentPage === 1;
    if (this.nextBtn) this.nextBtn.disabled = users.length < this.itemsPerPage;

    if (users.length === 0 && this.currentPage > 1) {
      this.goToPrevPage();
      return;
    }

    if (users.length === 0) {
      this.userTableBody.innerHTML = `<tr><td colspan="9" class="text-center p-4">No users found.</td></tr>`;
      return;
    }

    users.forEach((user) => {
      const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

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
          <td class="td text-gray-600">${user.createdAt}</td>
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

  // --- Pagination ---

  handlePageNumberClick(event) {
    const pageButton = event.target.closest(".page-number-btn");
    if (pageButton) {
      const page = parseInt(pageButton.dataset.page);
      this.goToPage(page);
    }
  }
  goToPrevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.displayUsers();
    }
  }

  goToNextPage() {
    if (!this.nextBtn.disabled) {
      this.currentPage++;
      this.displayUsers();
    }
  }
  goToPage(page) {
    this.currentPage = page;
    this.displayUsers();
  }

  async handleFormSubmit(event) {
    event.preventDefault();
    const formData = {
      name: document.getElementById("fullName").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      role: document.getElementById("role").value,
    };
    this.submitButton.disabled = true;

    if (this.isEditMode) {
      await this.userService.updateUser(this.editingUserId, formData);
    } else {
      await this.userService.addUser(formData);
    }

    this.submitButton.disabled = false;
    this.closeModal();

    await this.displayUsers();
  }

  async handleTableClick(event) {
    const editBtn = event.target.closest(".edit-btn");
    const deleteBtn = event.target.closest(".delete-btn");

    if (editBtn) {
      const userId = parseInt(editBtn.dataset.id);
      this.openModal("edit", userId);
    }
    if (deleteBtn) {
      const userId = parseInt(deleteBtn.dataset.id);
      if (confirm("Are you sure you want to delete this user?")) {
        await this.userService.deleteUser(userId);
        await this.displayUsers();
      }
    }
  }
}
