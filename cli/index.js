#!/usr/bin/env node

const { program } = require('commander');
const axios = require('axios');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const os = require('os');

const API_BASE_URL = 'http://localhost:3000/api';
const CONFIG_FILE = path.join(os.homedir(), '.lightlist', 'config.json');

program.version('1.0.0');

function saveConfig(config) {
  const dir = path.dirname(CONFIG_FILE);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  }
  return null;
}

program
  .command('signup')
  .description('Sign up for a new account')
  .action(async () => {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'email',
          message: 'Email:',
          validate: (input) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input)) {
              return 'Please enter a valid email address';
            }
            return true;
          }
        },
        {
          type: 'password',
          name: 'password',
          message: 'Password:',
          validate: (input) => {
            if (input.length < 6) {
              return 'Password must be at least 6 characters long';
            }
            return true;
          }
        },
        {
          type: 'list',
          name: 'lang',
          message: 'Language:',
          choices: [
            { name: 'Japanese', value: 'ja' },
            { name: 'English', value: 'en' }
          ],
          default: 'ja'
        }
      ]);

      console.log('Signing up...');

      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: answers.email,
        password: answers.password,
        lang: answers.lang
      });

      const data = response.data;

      saveConfig({
        user: data.user,
        session: data.session,
      });

      console.log('Signup successful!');
      console.log(`Welcome to Lightlist, ${data.user.email.split('@')[0]}!`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(`Error: ${error.response.data.error || 'Signup failed'}`);
      } else {
        console.error('Signup failed:', error.message);
      }
    }
  });

program
  .command('login')
  .description('Log in to your account')
  .action(async () => {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'email',
          message: 'Email:',
          validate: (input) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input)) {
              return 'Please enter a valid email address';
            }
            return true;
          }
        },
        {
          type: 'password',
          name: 'password',
          message: 'Password:',
          validate: (input) => {
            if (input.length < 6) {
              return 'Password must be at least 6 characters long';
            }
            return true;
          }
        }
      ]);

      console.log('Logging in...');

      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: answers.email,
        password: answers.password
      });

      const data = response.data;

      saveConfig({
        user: data.user,
        session: data.session,
      });

      console.log('Login successful!');
      console.log(`Welcome back, ${data.user.email.split('@')[0]}!`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(`Error: ${error.response.data.error || 'Login failed'}`);
      } else {
        console.error('Login failed:', error.message);
      }
    }
  });

program
  .command('settings')
  .description('Modify settings')
  .action(() => {
    console.log('Settings functionality will be implemented soon.');
  });

program
  .command('whoami')
  .description('Display the current logged in user')
  .action(() => {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const config = loadConfig();
        if (config.user) {
          console.log(`Logged in as: ${config.user.email}`);
        } else {
          console.log('Not logged in');
        }
      } else {
        console.log('Not logged in');
      }
    } catch (error) {
      console.error('Error checking user:', error.message);
      console.log('Not logged in');
    }
  });

program
  .parse(process.argv);

// Show help if no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
