// app.config.js

const getDynamicAppConfig = () => {
  const isProduction = process.env.APP_MODE === "production";

  // Note: debugger statements won't work in this file during the build process
  // console.log(`Configuring app for production mode: ${isProduction}`);

  const config = {
    // Shared values
    slug: isProduction ? "wihngo" : "wihngo-dev",
    name: isProduction ? "Wihngo" : "Wihngo Dev",

    // Pass dynamic variables to the app's JS code using the 'extra' field
    extra: {
      apiUrl: isProduction
        ? "https://wihngo-api.onrender.com/api/"
        : "https://horsier-maliah-semilyrical.ngrok-free.dev/api/",
      // Add other environment-specific variables here if needed
      eas: {
        projectId: "your-eas-project-id", // <-- Important for EAS builds
      },
    },
    // ... other standard Expo config fields like version, orientation, icons, etc.
  };

  return config;
};

// Export the function required by Expo CLI
export default ({ config }: { config: any }) => {
  // Merge static defaults from your original app.json (if applicable)
  // with the new dynamic configuration
  return {
    ...config,
    ...getDynamicAppConfig(),
  };
};
