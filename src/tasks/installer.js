import inquirer from 'inquirer';
import { exec } from 'shelljs';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { ArgumentNullError } from 'common-errors';

const INSTALLATION_FILE = '.packages';
const DOTS_NAME = 'dots';

const OPTIONS = {
  ALL: 'All',
  BREW: 'Install software with Brew',
  ATOM: 'Install Atom packages',
  NODE: 'Install Node packages',
  EXIT: 'Exit',
};

class Installer {
  constructor() {
    this.packages = this.readPackages(
      path.resolve(__dirname, '..', '..', DOTS_NAME, INSTALLATION_FILE)
    );
  }

  readPackages(packagePath) {
    if (!packagePath) return new ArgumentNullError('packagePath is not exist');

    const readFile = fs.readFileSync(packagePath, 'utf8');
    return yaml.safeLoad(readFile);
  }

  brew() {
    (this.packages.brew || []).forEach(brewPackage => exec(`brew install ${brewPackage}`));
    (this.packages.cask || []).forEach(caskPackage => exec(`brew cask install ${caskPackage}`));
  }

  atom() {
    (this.packages.apm || []).forEach(apmPackage => exec(`apm install ${apmPackage}`));
  }

  node() {
    (this.packages.npm || []).forEach(npmPackage => exec(`npm install -g ${npmPackage}`));
  }

  prompt() {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'option',
          message: 'Choose an install option',
          choices: [
            OPTIONS.ALL,
            OPTIONS.BREW,
            OPTIONS.ATOM,
            OPTIONS.NODE,
            OPTIONS.EXIT,
          ],
        },
      ])
      .then(({ option }) => {
        this.run(option);
      });
  }

  run(option) {
    if (option === OPTIONS.EXIT) {
      return;
    }

    const fullInstall = option === OPTIONS.ALL;

    if (fullInstall || option === OPTIONS.BREW) {
      this.brew();
    }

    if (fullInstall || option === OPTIONS.ATOM) {
      this.atom();
    }

    if (fullInstall || option === OPTIONS.NODE) {
      this.node();
    }
  }
}

export default new Installer();
