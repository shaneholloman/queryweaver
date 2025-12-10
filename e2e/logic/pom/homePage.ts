import { Locator, Page } from "@playwright/test";
import { waitForElementToBeVisible, waitForElementToBeEnabled } from "../../infra/utils";

export class HomePage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ==================== LOCATORS ====================

  // Header Elements
  private get logoImage(): Locator {
    return this.page.getByTestId("logo");
  }

  private get databaseStatusBadge(): Locator {
    return this.page.getByTestId("database-status-badge");
  }

  private get githubStarsLink(): Locator {
    return this.page.getByTestId("github-stars-link");
  }

  private get signInBtn(): Locator {
    return this.page.getByTestId("sign-in-btn");
  }

  private get userMenuTrigger(): Locator {
    return this.page.getByTestId("user-menu-trigger");
  }

  private get apiTokensMenuItem(): Locator {
    return this.page.getByTestId("api-tokens-menu-item");
  }

  private get logoutMenuItem(): Locator {
    return this.page.getByTestId("logout-menu-item");
  }

  // Sidebar Elements
  private get sidebarToggle(): Locator {
    return this.page.getByTestId("sidebar-toggle");
  }

  private get schemaViewerToggle(): Locator {
    return this.page.getByTestId("schema-viewer-toggle");
  }

  private get themeToggle(): Locator {
    return this.page.getByTestId("theme-toggle");
  }

  // Database Controls
  private get refreshSchemaBtn(): Locator {
    return this.page.getByTestId("refresh-schema-btn");
  }

  private get databaseSelectorTrigger(): Locator {
    return this.page.getByTestId("database-selector-trigger");
  }

  private get connectDatabaseBtn(): Locator {
    return this.page.getByTestId("connect-database-btn");
  }

  private get uploadSchemaBtn(): Locator {
    return this.page.getByTestId("upload-schema-btn");
  }

  private get schemaUploadInput(): Locator {
    return this.page.getByTestId("schema-upload-input");
  }

  // Database Dropdown Items
  private getDatabaseOption(databaseId: string): Locator {
    return this.page.getByTestId(`database-option-${databaseId}`);
  }

  private getDeleteGraphBtn(databaseId: string): Locator {
    return this.page.getByTestId(`delete-graph-btn-${databaseId}`);
  }

  // Chat Interface Elements
  private get chatInterface(): Locator {
    return this.page.getByTestId("chat-interface");
  }

  private get queryTextarea(): Locator {
    return this.page.getByTestId("query-textarea");
  }

  private get sendQueryBtn(): Locator {
    return this.page.getByTestId("send-query-btn");
  }

  private get chatMessagesContainer(): Locator {
    return this.page.getByTestId("chat-messages-container");
  }

  // Chat Messages
  private get userMessage(): Locator {
    return this.page.getByTestId("user-message");
  }

  private get aiMessage(): Locator {
    return this.page.getByTestId("ai-message");
  }

  private get sqlQueryMessage(): Locator {
    return this.page.getByTestId("sql-query-message");
  }

  private get queryResultsMessage(): Locator {
    return this.page.getByTestId("query-results-message");
  }

  private get resultsTable(): Locator {
    return this.page.getByTestId("results-table");
  }

  // Modals
  private get loginModal(): Locator {
    return this.page.getByTestId("login-modal");
  }

  private get databaseModal(): Locator {
    return this.page.getByTestId("database-modal");
  }

  private get deleteDatabaseModal(): Locator {
    return this.page.getByTestId("delete-database-modal");
  }

  private get tokensModal(): Locator {
    return this.page.getByTestId("tokens-modal");
  }

  // Login Modal Elements
  private get googleLoginBtn(): Locator {
    return this.page.getByTestId("google-login-btn");
  }

  private get githubLoginBtn(): Locator {
    return this.page.getByTestId("github-login-btn");
  }

  // Database Modal Elements
  private get databaseTypeSelect(): Locator {
    return this.page.getByTestId("database-type-select");
  }

  private get connectionModeUrl(): Locator {
    return this.page.getByTestId("connection-mode-url");
  }

  private get connectionModeManual(): Locator {
    return this.page.getByTestId("connection-mode-manual");
  }

  private get connectionUrlInput(): Locator {
    return this.page.getByTestId("connection-url-input");
  }

  private get hostInput(): Locator {
    return this.page.getByTestId("host-input");
  }

  private get portInput(): Locator {
    return this.page.getByTestId("port-input");
  }

  private get databaseNameInput(): Locator {
    return this.page.getByTestId("database-name-input");
  }

  private get usernameInput(): Locator {
    return this.page.getByTestId("username-input");
  }

  private get passwordInput(): Locator {
    return this.page.getByTestId("password-input");
  }

  private get databaseModalConnectBtn(): Locator {
    return this.page.getByTestId("database-modal-connect");
  }

  private get databaseModalCancelBtn(): Locator {
    return this.page.getByTestId("database-modal-cancel");
  }

  // Delete Modal Elements
  private get deleteModalConfirmBtn(): Locator {
    return this.page.getByTestId("delete-modal-confirm");
  }

  private get deleteModalCancelBtn(): Locator {
    return this.page.getByTestId("delete-modal-cancel");
  }

  // Tokens Modal Elements
  private get generateTokenBtn(): Locator {
    return this.page.getByTestId("generate-token-btn");
  }

  private get newTokenInput(): Locator {
    return this.page.getByTestId("new-token-input");
  }

  private get copyTokenBtn(): Locator {
    return this.page.getByTestId("copy-token-btn");
  }

  private get tokensTable(): Locator {
    return this.page.getByTestId("tokens-table");
  }

  private getDeleteTokenBtn(tokenId: string): Locator {
    return this.page.getByTestId(`delete-token-btn-${tokenId}`);
  }

  // ==================== ELEMENT INTERACTION FUNCTIONS ====================

  // Navigation Functions
  async clickOnSignInBtn(): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.signInBtn);
    if (!isVisible) throw new Error("Sign in button is not visible!");
    await this.signInBtn.click();
  }

  async clickOnUserMenu(): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.userMenuTrigger);
    if (!isVisible) throw new Error("User menu is not visible!");
    await this.userMenuTrigger.click();
  }

  async clickOnLogout(): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.logoutMenuItem);
    if (!isVisible) throw new Error("Logout menu item is not visible!");
    await this.logoutMenuItem.click();
  }

  async clickOnAPITokensMenuItem(): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.apiTokensMenuItem);
    if (!isVisible) throw new Error("API Tokens menu item is not visible!");
    await this.apiTokensMenuItem.click();
  }

  async clickOnSidebarToggle(): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.sidebarToggle);
    if (!isVisible) throw new Error("Sidebar toggle is not visible!");
    await this.sidebarToggle.click();
  }

  async clickOnSchemaViewerToggle(): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.schemaViewerToggle);
    if (!isVisible) throw new Error("Schema viewer toggle is not visible!");
    await this.schemaViewerToggle.click();
  }

  // Database Management Functions
  async clickOnRefreshSchema(): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.refreshSchemaBtn);
    if (!isVisible) throw new Error("Refresh schema button is not visible!");
    const isEnabled = await waitForElementToBeEnabled(this.refreshSchemaBtn);
    if (!isEnabled) throw new Error("Refresh schema button is not enabled!");
    await this.refreshSchemaBtn.click();
  }

  async clickOnDatabaseSelector(): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.databaseSelectorTrigger);
    if (!isVisible) throw new Error("Database selector is not visible!");
    await this.databaseSelectorTrigger.click();
  }

  async selectDatabase(databaseId: string): Promise<void> {
    await this.clickOnDatabaseSelector();
    const dbOption = this.getDatabaseOption(databaseId);
    const isVisible = await waitForElementToBeVisible(dbOption);
    if (!isVisible) throw new Error(`Database option ${databaseId} is not visible!`);
    await dbOption.click();
  }

  async clickOnConnectDatabase(): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.connectDatabaseBtn);
    if (!isVisible) throw new Error("Connect database button is not visible!");
    await this.connectDatabaseBtn.click();
  }

  async clickOnDeleteGraph(databaseId: string): Promise<void> {
    const deleteBtn = this.getDeleteGraphBtn(databaseId);
    const isVisible = await waitForElementToBeVisible(deleteBtn);
    if (!isVisible) throw new Error(`Delete graph button for ${databaseId} is not visible!`);
    await deleteBtn.click();
  }

  // Chat Functions
  async enterQuery(query: string): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.queryTextarea);
    if (!isVisible) throw new Error("Query textarea is not visible!");
    await this.queryTextarea.fill(query);
  }

  async clickOnSendQuery(): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.sendQueryBtn);
    if (!isVisible) throw new Error("Send query button is not visible!");
    const isEnabled = await waitForElementToBeEnabled(this.sendQueryBtn);
    if (!isEnabled) throw new Error("Send query button is not enabled!");
    await this.sendQueryBtn.click();
  }

  async sendQuery(query: string): Promise<void> {
    await this.enterQuery(query);
    await this.clickOnSendQuery();
  }

  // Login Modal Functions
  async clickOnGoogleLogin(): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.googleLoginBtn);
    if (!isVisible) throw new Error("Google login button is not visible!");
    await this.googleLoginBtn.click();
  }

  async clickOnGithubLogin(): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.githubLoginBtn);
    if (!isVisible) throw new Error("GitHub login button is not visible!");
    await this.githubLoginBtn.click();
  }

  // Database Connection Modal Functions
  async selectDatabaseType(type: "postgresql" | "mysql"): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.databaseTypeSelect);
    if (!isVisible) throw new Error("Database type select is not visible!");
    await this.databaseTypeSelect.click();
    await this.page.getByTestId(`${type}-option`).click();
  }

  async selectConnectionModeUrl(): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.connectionModeUrl);
    if (!isVisible) throw new Error("Connection mode URL button is not visible!");
    await this.connectionModeUrl.click();
  }

  async selectConnectionModeManual(): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.connectionModeManual);
    if (!isVisible) throw new Error("Connection mode Manual button is not visible!");
    await this.connectionModeManual.click();
  }

  async enterConnectionUrl(url: string): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.connectionUrlInput);
    if (!isVisible) throw new Error("Connection URL input is not visible!");
    await this.connectionUrlInput.fill(url);
  }

  async enterConnectionDetails(
    host: string,
    port: string,
    database: string,
    username: string,
    password: string
  ): Promise<void> {
    await this.hostInput.fill(host);
    await this.portInput.fill(port);
    await this.databaseNameInput.fill(database);
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async clickOnDatabaseModalConnect(): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.databaseModalConnectBtn);
    if (!isVisible) throw new Error("Database modal connect button is not visible!");
    await this.databaseModalConnectBtn.click();
  }

  async clickOnDatabaseModalCancel(): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.databaseModalCancelBtn);
    if (!isVisible) throw new Error("Database modal cancel button is not visible!");
    await this.databaseModalCancelBtn.click();
  }

  // ==================== COMPLEX WORKFLOWS ====================

  /**
   * Connect to database using URL mode
   */
  async connectDatabaseViaUrl(
    type: "postgresql" | "mysql",
    connectionUrl: string
  ): Promise<void> {
    await this.clickOnConnectDatabase();
    await this.selectDatabaseType(type);
    await this.selectConnectionModeUrl();
    await this.enterConnectionUrl(connectionUrl);
    await this.clickOnDatabaseModalConnect();
  }

  /**
   * Connect to database using manual mode
   */
  async connectDatabaseManually(
    type: "postgresql" | "mysql",
    host: string,
    port: string,
    database: string,
    username: string,
    password: string
  ): Promise<void> {
    await this.clickOnConnectDatabase();
    await this.selectDatabaseType(type);
    await this.selectConnectionModeManual();
    await this.enterConnectionDetails(host, port, database, username, password);
    await this.clickOnDatabaseModalConnect();
  }

  /**
   * Delete a database
   */
  async deleteDatabase(databaseId: string): Promise<void> {
    await this.clickOnDatabaseSelector();
    await this.clickOnDeleteGraph(databaseId);

    // Wait for delete modal
    const isVisible = await waitForElementToBeVisible(this.deleteDatabaseModal);
    if (!isVisible) throw new Error("Delete database modal is not visible!");

    await this.clickOnDeleteModalConfirm();
  }

  async clickOnDeleteModalConfirm(): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.deleteModalConfirmBtn);
    if (!isVisible) throw new Error("Delete modal confirm button is not visible!");
    await this.deleteModalConfirmBtn.click();
  }

  async clickOnDeleteModalCancel(): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.deleteModalCancelBtn);
    if (!isVisible) throw new Error("Delete modal cancel button is not visible!");
    await this.deleteModalCancelBtn.click();
  }

  // Token Management Functions
  async clickOnGenerateToken(): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.generateTokenBtn);
    if (!isVisible) throw new Error("Generate token button is not visible!");
    await this.generateTokenBtn.click();
  }

  async copyNewToken(): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.copyTokenBtn);
    if (!isVisible) throw new Error("Copy token button is not visible!");
    await this.copyTokenBtn.click();
  }

  async getNewTokenValue(): Promise<string> {
    const isVisible = await waitForElementToBeVisible(this.newTokenInput);
    if (!isVisible) throw new Error("New token input is not visible!");
    const value = await this.newTokenInput.inputValue();
    return value;
  }

  async deleteToken(tokenId: string): Promise<void> {
    const deleteBtn = this.getDeleteTokenBtn(tokenId);
    const isVisible = await waitForElementToBeVisible(deleteBtn);
    if (!isVisible) throw new Error(`Delete token button for ${tokenId} is not visible!`);
    await deleteBtn.click();

    // Confirm deletion in alert dialog
    await this.page.getByTestId("delete-token-confirm-action").click();
  }

  // ==================== VERIFICATION FUNCTIONS ====================

  async isLoggedIn(): Promise<boolean> {
    try {
      return await this.userMenuTrigger.isVisible();
    } catch {
      return false;
    }
  }

  async isDatabaseConnected(): Promise<boolean> {
    const badgeText = await this.databaseStatusBadge.textContent();
    return badgeText?.includes("Connected") || false;
  }

  async getSelectedDatabaseName(): Promise<string> {
    const badgeText = await this.databaseStatusBadge.textContent();
    return badgeText?.replace("Connected: ", "") || "";
  }

  async waitForQueryResults(): Promise<boolean> {
    return await waitForElementToBeVisible(this.queryResultsMessage, 1000, 30);
  }

  async waitForSQLQuery(): Promise<boolean> {
    return await waitForElementToBeVisible(this.sqlQueryMessage, 1000, 30);
  }

  async waitForAIResponse(): Promise<boolean> {
    return await waitForElementToBeVisible(this.aiMessage, 1000, 30);
  }
}
