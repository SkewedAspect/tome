// ---------------------------------------------------------------------------------------------------------------------
// Tome Site Configuration
// ---------------------------------------------------------------------------------------------------------------------

// This file is intended to override the defaults of Tome, allowing you to customize Tome to your personal needs. You
// can change the name, icon, and other instance specific information in this file.
//
// In order to override this file, we recommend you either use `docker cp` to copy the file, edit it, and copy it back
// in, or to mount this file as a read-only volume. (Check the docker documentation for how to do that.)

module.exports = {
    //------------------------------------------------------------------------------------------------------------------
    // Site Options
    //------------------------------------------------------------------------------------------------------------------

    // What is the name of the site? (Default: 'Tome')
    // siteName: 'Example Wiki',

    // If you want to use a Font Awesome icon for your logo, enable this option. (Default: [ 'far', 'fa-book-open' ])
    // faIcon: 'dumpster-fire',

    // If you want to use an image, specify the url here.
    // localIcon: '/assets/images/logo.png',

    // Should we allow new users to register by signing in with Google? (Default: true)
    // allowRegistration: true
};

// ---------------------------------------------------------------------------------------------------------------------
