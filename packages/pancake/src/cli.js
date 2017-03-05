/***************************************************************************************************************************************************************
 *
 * Running pancake inside a cli
 *
 * @repo    - https://github.com/govau/pancake
 * @author  - Dominik Wilkowski
 * @license - https://raw.githubusercontent.com/govau/pancake/master/LICENSE (MIT)
 *
 **************************************************************************************************************************************************************/

'use strict';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import Path from 'path';
// import Fs from 'fs';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module imports
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { ExitHandler, Cwd, Size, Spawning } from './helpers';
import { Log, Style, Loading } from './logging';
import { ParseArgs } from './parse-arguments';
import { CheckModules } from './conflicts';
import { GetModules } from './modules';
import { Settings } from './settings';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Default export
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Running the program in CLI
 *
 * @param  {array} argv - The arguments passed to node
 */
export const init = ( argv = process.argv ) => {

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Check npm version
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	let npmVersion = Spawning.sync( 'npm', ['-v'] );

	if( npmVersion.error ) {
		Log.error(`Pancake was unable to find an NPM version.`);
		Log.error( error )

		Log.space();
		process.exit( 1 );
	}
	else {
		npmVersion = parseInt( npmVersion.stdout.toString().replace('\n', '') ); //normalize some oddities npm gives us
	}

	Log.verbose(`NPM version ${ Style.yellow( npmVersion ) } detected`);

	//npm 3 and higher is required as below will install dependencies inside each module folder
	if( npmVersion < 3 ) {
		Log.error(`Pancake only works with npm 3 and later.`);
		Log.space();
		process.exit( 1 );
	}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get global settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	let SETTINGS = Settings.getGloabl();


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Parsing cli arguments
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	const ARGS = ParseArgs( SETTINGS, argv );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Finding the current working directory
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	const pkgPath = Cwd( ARGS.cwd );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get local settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	let SETTINGSlocal = Settings.getLocal( pkgPath );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Set global settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	if( ARGS.set.length > 0 ) {
		SETTINGS = Settings.setGloabl( SETTINGS, ...ARGS.set );

		Log.space();
		process.exit( 0 ); //finish after
	}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Display version
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	if( ARGS.version ) {
		const pkg = require( Path.normalize(`${ __dirname }/../package.json`) );

		console.log(`v${ pkg.version }`);

		if( ARGS.verbose ) { //show some space if we had verbose enabled
			Log.space();
		}

		process.exit( 0 ); //finish after
	}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Display help
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	if( ARGS.help ) {
		if( Size().width > 110 ) { //only show if we have enough space
			Log.info(`Pancake help`);

			console.log( Style.yellow(`
                                                 ${ Style.white(`.,;+@@@@@@@@@#+;,
                                              #+':               .+@@;
                                            @\`                       \`##
                                           @+   \`;@@#+'      ,+@@@@@@@@@@`) }
                                 \`,;''+#@@++${ Style.white(`@     .,;@;    @@@@@@@@@@@@@ #@@@@`) }+:\`
                          \`,'@@+,\`   :;:;+'${ Style.white(`\`:@@;.       \`@@@@@@@@@@@+..@@@@@@@@@@@`) }#;\`
                       +@#,        \`\`.,.  ${ Style.white(`@@.+ @@@':. \`;@#  ;.,+@@@@@@@@@@@@@@@@@@@@@@@@@@@`) }'
                   ,#@,     \`.\`        ${ Style.white(`#@.#@@@@@@#@@@ \`: ;@@@@@@@@@@@@@@@@@@@@@@@@@@@@@.@`) }   ;@'
               .@@@;:,\`  .;++;,      ${ Style.white(`#@#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@`) }        \`   \`@:
             @@,   ,;::;;,.        ${ Style.white(`@@@@@@@@@@@@#':'@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@`) }    \`  \`,\`  \`  .#+\`
           '@.   ..   ,'+':\`      ${ Style.white(`@@@@@@@@'\`        @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@`) }\'      .,  .\`     ,@'
        ,@+       '.               ${ Style.white(`@@@@,           ,@@@@@@:    .#@@@@@@@@@@@@@@@@@@@@@+`) }                  ;@
      ;@,                                           ${ Style.white(`#@+\`          .@@@@@+     .+@@@#+@`) };                    @
      @+      .@'++                                                 ${ Style.white(`:@@@`) }                                  @#
         +#@,          :;:':':                     - pancake -        ${ Style.white(`@@@`) }                         \`:'':  \`@'
       '@@@@@@@@@@,                                                    ${ Style.white(`@@`) }:      '\`  ,'+##@@@@@@@@@.    \`\`
   \`@@\`   \`::,';:;#@@@@@@#;.  \`,;++',                               .' ${ Style.white(`@@@`) }  ,@@@,@@@@@@@#+':,\`             ,+#
  :@\`                    .#@@@@@@+#@@@@@@@@@@@@@@#+''+++@@@@@@@+#+++   ${ Style.white(`@@@@`) };,,;,\`                             @
  \`@:                                   \`:;+#@@##@@@+;,\`              ${ Style.white(`#@';@@`) }                                 #,
    ;#+;            \`\`\`                                               ${ Style.white(`@@+@@#`) }                             .+'.
         '@@@@@@@@@@@@@@@@#.                             \`\`           ${ Style.white(`#@@@#`) }     \`\`         \`#@@@@@@:'@@@@@@,
                   \`\`...,,+@@@@@@@@'.\`.,;''#@@@;    \`'@@@@@@@@@@@@@@#:     @@@#'\` \`###@@#'.        ,;;,::
                                     ,@@@@@@@@#@@@:@@@@#;.`));
		}

		console.log(
			Style.yellow(`\n  ( ^-^)_旦\n\n`) +
			`  🥞  Pancake is an utility to make working with npm modules for the frontend sweet and seamlessly.\n\n` +
			`  It will check your peerDependencies for conflicts and comes with plugins to compile the contents\n` +
			`  for you and lists all available modules for you to select and install.\n\n` +
			`  ${ Style.gray(`-------------------------------------------------------------------------------------------------\n\n`) }` +
			`  ${ Style.bold(`PATH`) }            - Run pancake in a specific path and look for pancake modules there.\n` +
			`    $ ${ Style.gray(`pancake /Users/you/project/folder`) }\n\n` +
			`  ${ Style.bold(`SETTINGS`) }        - Set global settings. Available settings are: ${ Style.yellow( Object.keys( SETTINGS ).join(', ') ) }.\n` +
			`    $ ${ Style.gray(`pancake --set npmOrg "@yourOrg"`) }\n\n` +
			`  ${ Style.bold(`JSON`) }            - Temporarily overwrite the address to the json file of all your pancake modules.\n` +
			`    $ ${ Style.gray(`pancake --json https://domain.tld/pancake-modules.json`) }\n\n` +
			`  ${ Style.bold(`PLUGINS`) }         - Temporarily turn off all plugins.\n` +
			`    $ ${ Style.gray(`pancake --plugins`) }\n\n` +
			`  ${ Style.bold(`IGNORED PLUGINS`) } - Prevent a certain plugin(s) from being installed and run.\n` +
			`    $ ${ Style.gray(`pancake --ignore @gov.au/pancake-js,@gov.au/pancake-sass`) }\n\n` +
			`  ${ Style.bold(`HELP`) }            - Display the help (this screen).\n` +
			`    $ ${ Style.gray(`pancake --help`) }\n\n` +
			`  ${ Style.bold(`VERBOSE`) }         - Run pancake in verbose silly mode\n` +
			`    $ ${ Style.gray(`pancake --verbose`) }`
		);

		Log.space();
		process.exit( 0 ); //finish after
	}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Show banner
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	Log.info(`PANCAKE MIXING THE BATTER`);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get all modules data
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	Loading.start();

	const allPackages = GetModules( pkgPath, SETTINGS.npmOrg )
		.catch( error => {
			Log.error( error );

			process.exit( 1 );
	});

	allPackages
		.catch( error => {
			Loading.stop(); //stop loading animation

			Log.error(`Reading all package.json files bumped into an error: ${ error }`, verbose);
		})
		.then( allModules => { //once we got all the content from all package.json files
			Log.verbose(`Gathered all modules:\n${ Style.yellow( JSON.stringify( allModules ) ) }`);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Check for conflicts
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		if( allModules.length < 1 ) {
			Loading.stop();

			Log.info( `No modules found 😬` );
		}
		else {
			const conflicts = CheckModules( allModules );

			Loading.stop();

			if( conflicts.conflicts ) {
				Log.error( Style.red( conflicts.message ) );

				process.exit( 1 ); //error out so npm knows things went wrong
			}
			else {
				Log.ok( `All modules(${ allModules.length }) without conflict 💥` );
			}
		}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Install all plugins
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		//


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Run all plugins
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		//


	});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Adding some event handling to exit signals
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	process.on( 'exit', ExitHandler.bind( null, { withoutSpace: false } ) );              //on closing
	process.on( 'SIGINT', ExitHandler.bind( null, { withoutSpace: false } ) );             //on [ctrl] + [c]
	process.on( 'uncaughtException', ExitHandler.bind( null, { withoutSpace: false } ) );  //on uncaught exceptions
}
