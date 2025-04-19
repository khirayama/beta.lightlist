#!/usr/bin/env node

const { program } = require('commander');
const fetch = require('node-fetch');
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
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: answers.email,
          password: answers.password,
          lang: answers.lang
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`Error: ${data.error}`);
        return;
      }

      saveConfig({
        user: data.user,
        session: data.session,
      });

      console.log('Signup successful!');
      console.log(`Welcome to Lightlist, ${data.user.email.split('@')[0]}!`);
    } catch (error) {
      console.error('Signup failed:', error.message);
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
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: answers.email,
          password: answers.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`Error: ${data.error || 'Login failed'}`);
        return;
      }

      saveConfig({
        user: data.user,
        session: data.session,
      });

      console.log('Login successful!');
      console.log(`Welcome back, ${data.user.email.split('@')[0]}!`);
    } catch (error) {
      console.error('Login failed:', error.message);
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
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
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
