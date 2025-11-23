const { execSync } = require('child_process');

/**
 * Executes a git command and returns the output
 * @param {string} command - Git command to execute
 * @param {string} cwd - Working directory (optional)
 * @returns {string|null} Command output or null if failed
 */
function execGitCommand(command, cwd = process.cwd()) {
    try {
        return execSync(command, {
            encoding: 'utf-8',
            cwd: cwd
        }).trim();
    } catch (error) {
        return null;
    }
}

/**
 * Gets current git information
 * @param {string} projectDir - Directory of the git project (optional, defaults to current directory)
 * @returns {Object} Git information object
 */
function getGitInfo(projectDir = process.cwd()) {
    const info = {
        branch: execGitCommand('git rev-parse --abbrev-ref HEAD', projectDir) || 'unknown',
        commit: execGitCommand('git rev-parse --short HEAD', projectDir) || 'unknown',
        commitFull: execGitCommand('git rev-parse HEAD', projectDir) || 'unknown',
        author: execGitCommand('git log -1 --pretty=format:"%an"', projectDir) || 'unknown',
        authorEmail: execGitCommand('git log -1 --pretty=format:"%ae"', projectDir) || 'unknown',
        message: execGitCommand('git log -1 --pretty=format:"%s"', projectDir) || 'unknown',
        timestamp: execGitCommand('git log -1 --pretty=format:"%ci"', projectDir) || new Date().toISOString()
    };

    return info;
}

/**
 * Checks if a directory is a git repository
 * @param {string} dir - Directory to check (optional, defaults to current directory)
 * @returns {boolean}
 */
function isGitRepository(dir = process.cwd()) {
    try {
        execSync('git rev-parse --git-dir', {
            stdio: 'ignore',
            cwd: dir
        });
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    getGitInfo,
    isGitRepository
};
