// const cmd = require('node-cmd');

const cp = require('child_process');
const fs = require('fs');

const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule();

const stratNames = fs
	.readdirSync('backtests/config/')
	.filter(name => name.endsWith('.js'));

let children = [];

prepareCommands = function(data) {
	let {time} = data;
	let cmds = stratNames.map(name => ({
		command: 'forever',
		args: ['run.js', '--config', `../../backend/backtests/config/${name}`]
	}));

	return {
		commands: cmds,
		time: time, 
	}

}

let runNextCommand = function(commands, time) {
	let keepGoing = true;
	let command = commands.shift();

	let execCmd = function(command) {
		keepGoing = true;
		return cp.spawn(command.command, command.args, {
			cwd: '../gekko/gekkoga',
		});
	}

	let killCmd = cmd => {
		keepGoing = false;
		cmd.kill('SIGINT');
	}

	let handleDie = code => {
		console.log('it dedded');
		let cont = keepGoing;
		killCmd(cmd);
		if (cont) {
			console.log('restarting dedded process');
			cmd = execCmd(command);
		}
	}


	let cmd = execCmd(command);

	children.push(cmd);

	cmd.stdout.on('data', chunk => {
		console.log(chunk.toString());
	});

	cmd.stderr.on('data', chunk => {
		console.error(chunk.toString());
		// handleDie();
	});

	setTimeout(() => {
		keepGoing = false;
		killCmd(cmd);
		runNextCommand(commands, time);
	}, time);

}

process.on('exit', function() {
	console.log('running exit');
	// cp.exec('kill ' + gekko.pid)
	// gekko.kill('SIGINT');
	children.forEach(child => child.kill('SIGINT'));
});

prompt([{
	type: 'input',
	name: 'time',
	message: `Total run time in hours (${stratNames.length} strats to run)`,
}]).then(prepareCommands)
	.then(({commands, time}) => runNextCommand(commands, time/stratNames.length * 60 * 60 * 1000))
	.catch(err => console.error(err));

