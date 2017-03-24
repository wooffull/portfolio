var HFP = window.HFP || {};
(function (HFP, undefined) {
    Object.defineProperties(HFP, {
        /**
         * Returns whether or not the argument is undefined or null
         */
        undefinedOrNull: {
            value: function (arg) {
                return (arg === undefined || arg === null);
            }
        },

        /**
         * Quick-Access CSS class constants
         */
        Class: {
            value: {
                SELECTED_NAV_BAR_ELEMENT: "nav-bar-element-link-selected",
                FADE_IN: "fade-in",
                FADE_OUT: "fade-out",
                PROJECT_CONTAINER: "project-container group",
                PROJECT_IMAGE_CONTAINER: "project-image-container",
                PROJECT_DOWNLOAD_LINK: "project-download-link",
                PROJECT_DESCRIPTION_CONTAINER: "project-description-container",
                PROJECT_TITLE_CONTAINER: "project-title-container",
                PROJECT_NAME_CONTAINER: "project-name-container",
                PROJECT_CURRENT_CONTAINER: "project-current-container group",
                PROJECT_CURRENT_IMAGES: "project-current-images"
            }
        },

        /**
         * The different pages for the portfolio
         */
        Page: {
            value: {
                INDEX: "HECTOR",
                PROJECTS: "PROJECTS",
                RESUME: "RESUME",
                CONTACT: "CONTACT"
            }
        },

        Error: {
            value: {
                IMAGE_LOAD_FAIL: "Image failed to load"
            }
        },

        Event: {
            value: {
                PROJECT_UPDATE: "project_update"
            }
        }
    });
})(HFP);
