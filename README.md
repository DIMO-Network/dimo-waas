# DIMO WaaS

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

- [Running the app](#running-the-app)
  - [Install Dependencies](#install-dependencies)
  - [Starting the dev server](#starting-the-dev-server)
- [Best Practices](#best-practices)
  - [Adding to the .env file]()

## Running the app

### Install Dependencies

[**Homebrew**](https://brew.sh/)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

[**Node.js**](https://nodejs.org/en/about/previous-releases) LTS version 20 via package manager of choice:

[//]: # "ASDF collapsable"

<details>
<summary><a href="https://asdf-vm.com/guide/getting-started.html#getting-started"><b>ASDF</b></a></summary>

- Follow the steps in the linked guide for latest instructions on installing asdf for the most up to date instructions
- TL;DR - `bash
       brew install coreutils curl git
      `
^ asdf dependencies - `bash 
       git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.14.0
      `
^^ verify the branch version as it is likely to change
over time - You can also use Homebrew to install asdf but the git method is recommended - `bash
        brew install asdf
        ` - [update your rc file to add asdf to your shell path](https://asdf-vm.com/guide/getting-started.html#_3-install-asdf) - MacOS default shell is zsh since Catalina - Install [**asdf-nodejs**](https://github.com/asdf-vm/asdf-nodejs) plugin - `bash
         asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git
        ` - Current LTS is [20.13.1](https://endoflife.date/nodejs) - `bash 
           asdf install nodejs 20.13.1
          `
</details>

[//]: # "NVM collapsable"

<details>
<summary><a href="https://github.com/nvm-sh/nvm"><b>NVM</b></a></summary>

- ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  ```

- Add the following to your `~/.bash_profile`, `~/.zshrc`, `~/.profile`, or `~/.bashrc`:
  - ```bash
    export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
    ```
- Then install current LTS version of node, using the [.nvmrc](https://github.com/nvm-sh/nvm#nvmrc) file already in the project by running:
  - ```bash
    nvm install
    ```

</details>

**.env file**

- Currently, you will need to ask someone on the team for contents of the .env file
  - TODO - set up an encrypted / secure location for this file and other sensitive project items
- There is an example`.env.example` file in the root of the project.

### Starting the dev server

To run the development server:

- `npm run dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Best Practices

- #### **Adding to .env file**

  - When adding a new key to the `.env` file, be sure to add it to the `.env.example` file as well.
  - The format for this is `ACTUAL_KEY_NAME_HERE="<KEY>"`
  - Copying one of the previous lines and changing the key name is the easiest way to do this.

- #### **Linting**

  - The project has eslint set up with the recommended rules.
  - Before submitting a PR make sure to run `npm run lint` and fix any issues that come up.

- #### **Updating NodeJS version**
  - We always want to use the LTS version of node.
  - If you're using nvm, running `nvm install` will always install the latest LTS version.
    - If the version of node that is installed is updated be sure to update the `.tool-versions` file with the updated version number
    - ASDF does not have a way to easily set the version used to LTS so this will allow all members regardless of their local setup to use the same version.
