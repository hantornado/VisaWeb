##  Cool Things It Can Do

-  Safe login with passport number and special code
-  See your application status on a simple dashboard
-  Admin panel for managing all applications
-  Super secure to keep your information safe
-  All your important information is encrypted

##  How to Start Everything

###  Setting Up the Backend (Server)

1. **Get the Code Ready**
   ```bash
   # Go to the backend folder
   cd backend
   
   # Install all the necessary parts
   npm install
   ```

2. **Set Up Your Secret Information**
   - Copy the `.env.example` file and rename it to `.env`
   - Fill in all the blank spaces with your information
   - Make sure to create a strong `JWT_SECRET` and `ENCRYPTION_KEY`

3. **Start the Server**
   ```bash
   # Start in development mode
   npm run dev
   
   # OR start in production mode
   npm start
   ```

###  Setting Up the Frontend (Website)

1. **Get the Code Ready**
   ```bash
   # Go to the frontend folder
   cd frontend
   
   # Install all the necessary parts
   npm install
   ```

2. **Start the Website**
   ```bash
   # Start in development mode
   npm run dev
   
   # OR build for production
   npm run build
   ```

###  Keeping Everything Updated

We have a special script to safely update all the parts:

```bash
# Make the script runnable
chmod +x backend/scripts/update-dependencies.sh

# Run the update script
./backend/scripts/update-dependencies.sh
```

##  How to Use as a Regular Person

1. **Go to the Website**
   - Open your web browser and go to the website address

2. **Log In**
   - Enter your passport number
   - Enter the special code you received when you applied
   - Click the "Check Status" button

3. **See Your Status**
   - Your application status will appear on the dashboard
   - You'll see details like current status, submission date, and any messages

##  How to Use as an Administrator

1. **Go to the Admin Page**
   - Open your web browser and go to the website address + "/admin"

2. **Log In as Admin**
   - Enter your admin username and password
   - Click the "Login" button

3. **Manage Applications**
   - See all visa applications in one place
   - Search for specific applications by passport number or name
   - Sort applications by date, status, or country

4. **Update Application Status**
   - Click on any application to see details
   - Select a new status from the dropdown menu
   - Add any notes or comments
   - Click "Update Status" to save changes

##  Common Problems and Fixes

### The Website Won't Load
- Check if your internet is working
- Make sure you typed the website address correctly
- Try using a different web browser

### Can't Log In
- Double-check your passport number for typos
- Make sure you're using the correct special code
- If you forgot your code, contact support

### Backend Server Won't Start
- Make sure MongoDB is running
- Check if all environment variables are set correctly in `.env`
- Look at the error messages for clues

### Frontend Won't Start
- Make sure you've installed all dependencies with `npm install`
- Check if the backend server address is correct in your configuration
- Try deleting the `node_modules` folder and running `npm install` again

##  Security Features

- HTTPS encryption for all connections
- Protection against common attacks (SQL injection, XSS, CSRF)
- Password hashing for admin accounts
- Data encryption for sensitive information
- Regular security updates

##  More Information

- For detailed deployment instructions, see `deployment-guide.md`
- For security best practices, see `security-guide.md`
- For development tasks and progress, see `task.md`
