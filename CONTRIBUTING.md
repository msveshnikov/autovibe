# Contributing to AutoVibe

First off, thank you for considering contributing to AutoVibe! It's people like you that make
AutoVibe such a great tool.

We welcome contributions in various forms, including bug reports, feature suggestions, documentation
improvements, and code contributions.

## Ways to Contribute

### Reporting Bugs

If you find a bug, please ensure the bug was not already reported by searching on GitHub under
[Issues](https://github.com/msveshnikov/autovibe/issues).

If you're unable to find an open issue addressing the problem,
[open a new one](https://github.com/msveshnikov/autovibe/issues/new). Be sure to include a **title
and clear description**, as much relevant information as possible, and a **code sample or an
executable test case** demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

If you have an idea for a new feature or an improvement to an existing one, please search the
[Issues](https://github.com/msveshnikov/autovibe/issues) to see if it has already been suggested. If
not, [open a new issue](https://github.com/msveshnikov/autovibe/issues/new) describing your
suggestion. Provide as much detail and context as possible.

### Pull Requests

We love pull requests! If you're planning to contribute code, please follow these steps:

1.  **Fork the repository:** Click the 'Fork' button on the top right of the
    [AutoVibe repository](https://github.com/msveshnikov/autovibe) page.
2.  **Clone your fork:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/autovibe.git
    cd autovibe
    ```
3.  **Set up for development:** Follow the "Installation (Local Development)" instructions in the
    main `README.md` file to get your local environment set up.
    ```bash
    # Using Bun
    bun install
    # Or using Node.js/npm
    # npm install
    ```
4.  **Create a new branch:** Create a branch for your changes. Use a descriptive name.
    ```bash
    git checkout -b feature/your-feature-name
    # or
    git checkout -b fix/your-bug-fix-name
    ```
5.  **Make your changes:** Implement your feature or bug fix.
6.  **Format your code:** Ensure your code adheres to the project's coding style by running the
    formatter. We use Prettier.
    ```bash
    # If a format script is defined in package.json (add one if needed)
    # bun run format
    # Or run Prettier directly
    # npx prettier --write .
    ```
7.  **Commit your changes:** Write clear and concise commit messages.
    ```bash
    git add .
    git commit -m "feat: Add new feature X"
    # or
    git commit -m "fix: Resolve issue Y"
    ```
8.  **Push to your fork:**
    ```bash
    git push origin feature/your-feature-name
    ```
9.  **Open a Pull Request:** Go to the original
    [AutoVibe repository](https://github.com/msveshnikov/autovibe) and click the 'New pull request'
    button. Choose your fork and the branch you just pushed. Provide a clear description of your
    changes in the pull request. Reference any related issues (e.g., "Closes #123").

## Development Setup

Please refer to the "Installation (Local Development)" section in the `README.md` file for detailed
instructions on setting up the project locally.

## Code Style

- We use **Prettier** for code formatting. Please ensure your code is formatted using Prettier
  before submitting a pull request. Configuration can be found in `.prettierrc`.
- Follow standard JavaScript best practices.
- Keep code clear, concise, and well-commented where necessary.

## License

By contributing to AutoVibe, you agree that your contributions will be licensed under its MIT
License. You can find the full license text in the `LICENSE` file.

Thank you again for your contribution!
