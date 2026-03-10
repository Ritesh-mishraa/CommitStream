const { execSync } = require('child_process');
const fs = require('fs');

function run(cmd) {
    console.log(`> ${cmd}`);
    try {
        execSync(cmd, { stdio: 'inherit' });
    } catch (e) {
        // Ignore errors for git commit if there's nothing to commit
        if (!cmd.includes('commit')) {
            throw e;
        }
    }
}

try {
    run('git add .');
    run('git commit -m "Fix GitHub API exact branch comparison"');
    run('git push origin main');

    // Setup test-branch-a
    run('git checkout test-branch-a');
    run('git pull origin test-branch-a');
    run('git merge main -m "Merge main into test-branch-a"');
    fs.writeFileSync('conflict_test.txt', 'This is the content from TEST-BRANCH-A. It is totally different!\n');
    run('git add conflict_test.txt');
    run('git commit -m "Add conflict file from branch A"');
    run('git push origin test-branch-a');

    // Setup test-branch-b
    run('git checkout test-branch-b');
    run('git pull origin test-branch-b');
    run('git merge main -m "Merge main into test-branch-b"');
    fs.writeFileSync('conflict_test.txt', 'This is the content from TEST-BRANCH-B. Very conflicting indeed.\n');
    run('git add conflict_test.txt');
    run('git commit -m "Add conflict file from branch B"');
    run('git push origin test-branch-b');

    run('git checkout main');
    console.log("TEST BRANCHES SETUP SUCCESSFUL");
} catch (e) {
    console.error("TEST BRANCH SETUP FAILED:", e.message);
}
