//----------------------------------------------------------------------------------------------------------------------
// AppManager
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const path = require('path');

//----------------------------------------------------------------------------------------------------------------------

class AppManager
{
    constructor()
    {
        this.libDir = path.resolve(path.normalize(path.join(__dirname, '..', '..')));
        this.rootDir = this.libDir;
    } // end constructor

    setRootDir(rootPath)
    {
        this.rootDir = path.resolve(rootPath);
    } // end setRootDir

    getLibPath(relPath)
    {
        return path.resolve(path.normalize(path.join(this.libDir, relPath)));
    } // end getLibDir

    getRootPath(relPath)
    {
        return path.resolve(path.normalize(path.join(this.rootDir, relPath)));
    } // end getRootPath
} // end AppManager

//----------------------------------------------------------------------------------------------------------------------

module.exports = new AppManager();

//----------------------------------------------------------------------------------------------------------------------
