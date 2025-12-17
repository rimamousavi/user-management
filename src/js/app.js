function debounce(func, delay) {
  let timeoutId;

  // تابع جدیدی که برگردانده می‌شود
  return function (...args) {
    // هر بار که این تابع (مثلا با هر بار تایپ) اجرا می‌شود،
    // تایمر قبلی را پاک می‌کنیم.
    clearTimeout(timeoutId);

    // یک تایمر جدید تنظیم می‌کنیم.
    timeoutId = setTimeout(() => {
      // فقط زمانی که تایمر تمام شد (یعنی کاربر تایپ را متوقف کرد)،
      // تابع اصلی (func) را اجرا کن.
      func.apply(this, args);
    }, delay);
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://693e775f12c964ee6b6d71d4.mockapi.io/api/v1/users";

  const userService = new UserService(API_URL);

  new App(userService);
});

class UserService {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async getUsers(page, limit, filters, sort) {
    console.log(sort);
    // شروع یک بلوک try-catch برای مدیریت خطاهای احتمالی (مانند قطع بودن شبکه).
    try {
      // ---- مرحله ۱: دریافت کاربران برای نمایش در صفحه فعلی ----

      // یک آبجکت URL از آدرس پایه API می‌سازیم تا بتوانیم پارامترها را به راحتی به آن اضافه کنیم.
      const url = new URL(this.apiUrl);
      if (limit !== "all") {
        // اگر شماره صفحه‌ای (page) به تابع داده شده، آن را به عنوان پارامتر به URL اضافه کن (مثلاً: ?page=2).
        if (page) url.searchParams.append("page", page);

        // اگر محدودیتی (limit) برای تعداد آیتم‌ها در هر صفحه داده شده، آن را هم به URL اضافه کن (مثلاً: &limit=5).
        if (limit) url.searchParams.append("limit", limit);
      }

      // (کد محافظ) اگر هیچ فیلتری به تابع پاس داده نشده بود (مقدارش undefined بود)، آن را به یک آبجکت خالی تبدیل کن تا در خطوط بعدی خطا ندهد.
      filters = filters || {};

      // اگر در آبجکت فیلترها، مقداری برای 'search' وجود داشت، آن را به پارامترهای URL اضافه کن.
      if (filters.search) url.searchParams.append("search", filters.search);

      // اگر در آبجکت فیلترها، مقداری برای 'role' وجود داشت، آن را به پارامترهای URL اضافه کن.
      if (filters.role) url.searchParams.append("role", filters.role);

      // اگر در آبجکت فیلترها، مقداری برای 'status' وجود داشت، آن را به پارامترهای URL اضافه کن.
      if (filters.status) url.searchParams.append("status", filters.status);

      // این پارامترها فقط روی fetch اول تاثیر دارند، چون ترتیب در شمارش کل مهم نیست.
      if (sort && sort.sortBy) {
        url.searchParams.append("sortBy", sort.sortBy);
        // پارامتر order اختیاری است، اما ما آن را هم اضافه می‌کنیم.
        if (sort.order) {
          url.searchParams.append("order", sort.order);
        }
      }

      // درخواست اول را به API ارسال کن (با تمام پارامترها) و منتظر پاسخ بمان.
      const response = await fetch(url.toString());

      // پاسخ را از فرمت JSON به یک آرایه جاوااسکریپت تبدیل کن. این آرایه فقط شامل کاربران صفحه فعلی است.
      const users = await response.json();

      // ---- مرحله ۲: محاسبه تعداد کل کاربران منطبق با فیلترها ----

      // یک آبجکت URL جدید برای درخواست دوم می‌سازیم. این درخواست برای شمارش تعداد کل است.
      const countUrl = new URL(this.apiUrl);

      // (مهم) دوباره همان فیلترها را روی این URL جدید هم اعمال می‌کنیم تا شمارش ما دقیق باشد.
      // اگر فیلتر 'search' وجود داشت، آن را اضافه کن.
      if (filters.search)
        countUrl.searchParams.append("search", filters.search);

      // اگر فیلتر 'role' وجود داشت،آن را به پارامترهای URL اضافه کن.
      if (filters.role) countUrl.searchParams.append("role", filters.role);

      // اگر فیلتر 'status' وجود داشت، آن را به پارامترهای URL اضافه کن.
      if (filters.status)
        countUrl.searchParams.append("status", filters.status);

      // درخواست دوم را ارسال کن (این بار بدون page و limit) تا *تمام* کاربران منطبق با فیلترها را بگیریم.
      const allUsersResponse = await fetch(countUrl.toString());

      // پاسخ دوم را به آرایه جاوااسکریپت تبدیل کن. این آرایه شامل همه کاربران فیلتر شده است.
      const allUsers = await allUsersResponse.json();

      // (محاسبه نهایی) چک کن آیا 'allUsers' یک آرایه است؟ اگر بله، طول (تعداد اعضای) آن را در totalCount بریز. اگر نه، مقدار 0 را قرار بده.
      const totalCount = Array.isArray(allUsers) ? allUsers.length : 0;

      // یک آبجکت شامل هر دو نتیجه (لیست کاربران صفحه فعلی و تعداد کل) را برگردان.
      return { users, totalCount };

      // اگر در هر یک از مراحل بالا خطایی رخ داد...
    } catch (error) {
      // خطا را در کنسول نمایش بده تا برنامه‌نویس آن را ببیند.
      console.error("Error fetching users:", error);

      // یک نتیجه خالی برگردان تا برنامه کرش نکند و UI بتواند وضعیت "بدون کاربر" را نمایش دهد.
      return { users: [], totalCount: 0 };
    }
  }

  async findUserById(userId) {
    try {
      const response = await fetch(`${this.apiUrl}/${userId}`);
      return await response.json();
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
      return response.ok;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
}

class App {
  constructor(userService) {
    this.userService = userService;
    this.selectedUserIds = new Set();
    this.displayedUsers = [];
    this.currentPage = 1;
    this.itemsPerPage = 5;
    this.totalUsers = 0;
    this.isEditMode = false;
    this.editingUserId = null;
    this.currentFilters = { search: "", role: "", status: "" };
    this.currentSort = { sortBy: "createdAt", order: "asc" };

    this._initDOMElements();
    this._initEventListeners();
    this.displayUsers();
  }
  _initDOMElements() {
    this.selectAllCheckbox = document.getElementById("select-all-checkbox");
    this.extractBtn = document.getElementById("extract-btn");
    this.perPage = document.getElementById("per-page");
    this.sort = document.getElementById("sort");
    this.searchInput = document.getElementById("search");
    this.rolesFilter = document.getElementById("roles-filter");
    this.statusFilter = document.getElementById("status-filter");
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
    this.selectAllCheckbox.addEventListener("change", (event) =>
      this._handleSelectAll(event)
    );
    this.extractBtn.addEventListener("click", () =>
      this._extractSelectedUsers()
    );
    this.perPage.addEventListener("change", (e) => this._ItemsPerPage(e));
    this.sort.addEventListener("change", (e) => this._handleSort(e));
    this.searchInput.addEventListener(
      "input",
      debounce((e) => this._handleSearch(e), 800)
    );
    this.rolesFilter.addEventListener("change", (e) => this.RolesFilter(e));
    this.statusFilter.addEventListener("change", (e) => this.StatusFilter(e));
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
    this.userTableBody.addEventListener("change", (e) => {
      if (e.target.classList.contains("row-checkbox")) {
        this._handleRowSelection(e.target);
      }
    });
  }

  _handleSort(e) {
    const value = e.target.value;
    console.log(value.split("_"));

    const [sortBy, order] = value.split("_");
    this.currentSort = { sortBy, order };
    this.currentPage = 1;
    this.displayUsers();
  }
  _handleSearch(e) {
    const searchTerm = e.target.value.trim();
    this.currentFilters.search = searchTerm;
    this.currentPage = 1;
    this.displayUsers();
  }
  RolesFilter(e) {
    // پیاده‌سازی فیلتر بر اساس نقش کاربر
    this.currentFilters.role = e.target.value || "";

    this.currentPage = 1;
    this.displayUsers();
  }
  StatusFilter(e) {
    const value = e.target.value || "";
    this.currentFilters.status = value;
    console.log("Filter set to:", this.currentFilters.status);
    this.currentPage = 1;
    this.displayUsers();
  }
  _ItemsPerPage(e) {
    try {
      const value = e.target.value;
      console.log(value);
      this.itemsPerPage = value;
      this.currentPage = 1;
      this.displayUsers();
    } catch (error) {
      console.log(error);
    }
  }
  async openModal(mode, userId = null) {
    this.isEditMode = mode === "edit";
    this.editingUserId = userId;
    this.userForm.reset();

    if (this.isEditMode) {
      this.modalTitle.textContent = "Edit User";
      this.submitButton.textContent = "Save Changes";
      const userToEdit = await this.userService.findUserById(userId);
      if (userToEdit) {
        document.getElementById("fullName").value = userToEdit.name;
        document.getElementById("email").value = userToEdit.email;
        document.getElementById("phone").value = userToEdit.phone;
        document.getElementById("role").value = userToEdit.role;
        document.getElementById("status-in-modal").value = userToEdit.status;
      }
    } else {
      this.modalTitle.textContent = "Add New User";
      this.submitButton.textContent = "Add User";
    }
    this.userModal.classList.remove("hidden");
  }
  closeModal() {
    this.userModal.classList.add("hidden");
  }
  async displayUsers() {
    this.userTableBody.innerHTML = `<tr><td colspan="9" class="text-center p-4">Loading...</td></tr>`;
    const { users, totalCount } = await this.userService.getUsers(
      this.currentPage,
      this.itemsPerPage,
      this.currentFilters,
      this.currentSort
    );
    this.displayedUsers = users;
    this.totalUsers = totalCount;

    if (users.length === 0 && this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
      return;
    }
    if (users.length === 0) {
      this.userTableBody.innerHTML = `<tr><td colspan="9" class="text-center p-4">No users found.</td></tr>`;
      this.renderPagination();
      return;
    }
    this.updateTable(users);
    this.renderPagination();
  }
  updateTable(users) {
    try {
      if (!users && users.length === 0) {
        this.userTableBody.innerHTML = `<tr><td colspan="9" class="text-center p-4">No users found.</td></tr>`;
        return;
      }

      const rowsHtml = users?.map((user) => {
        const isActive = user.status === true;
        const initials = user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase();

        return `
        <tr class="hover:bg-gray-50 [&_tr:last-child]:border-0">
          <td class="td">
            <label class="check-container">
              <input 
              data-user-id="${user.id}" 
              class="row-checkbox" 
              type="checkbox" 
              ${this.selectedUserIds.has(user.id) ? "checked" : ""}
            />
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
                <input data-id="${user.id}" data-name="${user.name}"  class="switch-btn" type="checkbox" ${isActive ? "checked" : " "} />
                <span class="slider round"></span>
              </label>
              <span class="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 focus-visible:border-[--ring] focus-visible:ring-[#a1a1a1]/50 focus-visible:ring-[3px] dark:aria-invalid:ring-[--destructive]/40 transition-[color,box-shadow] overflow-hidden border-transparent bg-[--primary] text-[--primary-foreground] [a&]:hover:bg-[--primary]/90">
                ${isActive ? "Active" : "inactive"}
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
      });
      this.userTableBody.innerHTML = rowsHtml.join("");
    } catch (error) {
      this.userTableBody.innerHTML = `<tr><td colspan="9" class="text-center p-4">No users found.</td></tr>`;
    }
    this._syncSelectAllCheckboxState();
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
      this.goToPage(this.currentPage - 1);
    }
  }
  goToNextPage() {
    const totalPages = Math.ceil(this.totalUsers / this.itemsPerPage);
    if (this.currentPage < totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }
  goToPage(page) {
    this.currentPage = page;
    this.displayUsers();
  }
  renderPagination() {
    const totalPages = Math.ceil(this.totalUsers / this.itemsPerPage);
    this.pageButtonsContainer.innerHTML = "";

    // تولید دکمه‌های شماره صفحات
    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement("button");
      button.textContent = i;
      button.dataset.page = i;
      button.className = `pagination-button page-number-btn ${i === this.currentPage ? "bg-gray-200" : ""}`;
      this.pageButtonsContainer.appendChild(button);
    }

    // فعال/غیرفعال کردن دکمه‌های Next/Previous
    this.prevBtn.disabled = this.currentPage === 1;
    this.nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;

    // به‌روزرسانی خلاصه pagination
    const start = (this.currentPage - 1) * this.itemsPerPage + 1 || 1;
    const end =
      Math.min(start + this.itemsPerPage - 1, this.totalUsers) ||
      this.totalUsers;
    this.paginationSummary.textContent = `Showing ${this.totalUsers > 0 ? start : 0} – ${end} of ${this.totalUsers} users`;
  }

  async handleFormSubmit(event) {
    event.preventDefault();

    const statusValue = document.getElementById("status-in-modal").value;
    console.log(statusValue);

    const formData = {
      name: document.getElementById("fullName").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      role:
        document.getElementById("role").value === "Select a role"
          ? "user"
          : document.getElementById("role").value,
      status: statusValue === "true",
    };
    this.submitButton.disabled = true;

    if (this.isEditMode) {
      await this.userService.updateUser(this.editingUserId, formData);
    } else {
      await this.userService.addUser(formData);
      this.currentPage = Math.ceil((this.totalUsers + 1) / this.itemsPerPage);
    }

    this.submitButton.disabled = false;
    this.closeModal();
    await this.displayUsers();
  }
  async handleTableClick(event) {
    const editBtn = event.target.closest(".edit-btn");
    const deleteBtn = event.target.closest(".delete-btn");
    const switchInput = event.target.closest(".switch-btn");

    if (editBtn) {
      const userId = editBtn.dataset.id;
      this.openModal("edit", userId);
      return;
    }

    if (deleteBtn) {
      const userId = deleteBtn.dataset.id;
      if (confirm("Are you sure you want to delete this user?")) {
        await this.userService.deleteUser(userId);
        await this.displayUsers();
      }
      return;
    }

    if (switchInput) {
      const userId = switchInput.dataset.id;
      const newStatus = switchInput.checked;
      const userName = switchInput.dataset.name;
      if (
        confirm(
          `Are you sure you want to ${newStatus ? "Active" : "Inactive"} ${userName} ?`
        )
      ) {
        await this.userService.updateUser(userId, { status: newStatus });

        await this.displayUsers();
      } else {
        switchInput.checked = !newStatus;
      }
      return;
    }
  }
  _handleRowSelection(checkbox) {
    const userId = checkbox.dataset.userId;
    const isChecked = checkbox.checked;

    if (isChecked) {
      this.selectedUserIds.add(userId);
    } else {
      this.selectedUserIds.delete(userId);
    }
    console.log("Selected IDs:", this.selectedUserIds);
    this._syncSelectAllCheckboxState();
  }
  _extractSelectedUsers() {
    // تمام چک‌باکس‌هایی که تیک خورده‌اند را پیدا کن
    const checkedBoxes = document.querySelectorAll(".row-checkbox:checked");

    if (checkedBoxes.length === 0) {
      alert("Please select at least one user to extract.");
      return;
    }

    // ID تمام کاربران انتخاب شده را استخراج کن
    const selectedUserIds = Array.from(checkedBoxes).map(
      (checkbox) => checkbox.dataset.userId
    );

    // حالا آبجکت کامل کاربران انتخاب شده را از لیستی که قبلا ذخیره کردیم، پیدا کن
    const usersToExport = this.displayedUsers.filter((user) =>
      selectedUserIds.includes(user.id)
    );

    // (اختیاری) می‌توانید انتخاب کنید کدام ستون‌ها را می‌خواهید استخراج کنید
    const dataForSheet = usersToExport.map((user) => ({
      Name: user.name,
      Email: user.email,
      Phone: user.phone,
      Role: user.role,
      Status: user.status ? "Active" : "Inactive",
      "Created At": new Date(user.createdAt).toLocaleString(),
    }));

    // --- استفاده از کتابخانه SheetJS ---

    // ۱. ساخت یک Worksheet از روی داده‌های JSON
    const worksheet = XLSX.utils.json_to_sheet(dataForSheet);

    // ۲. ساخت یک Workbook جدید
    const workbook = XLSX.utils.book_new();

    // ۳. اضافه کردن Worksheet به Workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users"); // "Users" نام شیت در فایل اکسل خواهد بود

    // ۴. تولید و دانلود فایل Excel
    // نام فایل را می‌توان به صورت داینامیک تولید کرد
    XLSX.writeFile(workbook, `Users-Export-${Date.now()}.xlsx`);
  }
  _handleSelectAll(event) {
    const isChecked = event.target.checked;

    // تمام چک‌باکس‌های ردیف‌ها که در حال حاضر در صفحه هستند را پیدا کن.
    const allRowCheckboxes =
      this.userTableBody.querySelectorAll(".row-checkbox");

    allRowCheckboxes.forEach((checkbox) => {
      // وضعیت هر چک‌باکس ردیف را با وضعیت چک‌باکس هدر یکسان کن.
      checkbox.checked = isChecked;

      const userId = checkbox.dataset.userId;

      // "حافظه" اصلی برنامه را هم آپدیت کن.
      if (isChecked) {
        this.selectedUserIds.add(userId);
      } else {
        this.selectedUserIds.delete(userId);
      }
    });

    console.log("Selected IDs after Select All:", this.selectedUserIds);
  }
}
