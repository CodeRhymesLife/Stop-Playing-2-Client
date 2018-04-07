// @flow
import tasklist from 'tasklist'
import _ from 'lodash'

const LOG_TAG = '[Monitor]'

// Check every minute
const DefaultMonitorInterval = 1000 * 60

// Monitors tasks running on the computer
// and fires an event when one is found
export default class Monitor {
	_options: Object
	_watchIntervalKey: number

	constructor(options: Object) {
		this._options = _.clone(options || {})
		_.defaults(this._options, {
			interval: DefaultMonitorInterval,
			taskFoundCallback: _.noop,
			watchList: [],
		})

		this._watchIntervalKey = -1

		// Lowercase all items in the watchlist
		for(let taskIndex = 0; taskIndex < this._options.watchList.length; taskIndex++)
			this._options.watchList[taskIndex] = this._options.watchList[taskIndex].toLowerCase()
	}

	start() {
		this.stop()

		console.log(LOG_TAG, `starting with options ${JSON.stringify(this._options, null, 2)}`)

		// Check for tasks periodically
		const self = this
		this._watchIntervalKey = setInterval(async () => await self.checkTasks(), this._options.interval)
	}

	stop() {
		if(this.isRunning) {
			console.log(LOG_TAG, 'stopping')

			clearInterval(this._watchIntervalKey)
			this._watchIntervalKey = -1
			return true
		}

		return false
	}

	get isRunning(): boolean {
		return this._watchIntervalKey != -1
	}

	async checkTasks() {
		const watchList = this._options.watchList

		console.log(LOG_TAG, `searching for tasks [${watchList.join(',')}]`)

		const tasks = await tasklist()

		console.log(LOG_TAG, `tasklist returned ${tasks.length} tasks`)
		const found = tasks.filter(task => watchList.includes(task.imageName.toLowerCase()))
		
		// If we found tasks fire the callback
		const taskFoundCallback = this._options.taskFoundCallback
		if(taskFoundCallback && found && found.length > 0) {
			console.log(LOG_TAG, `found ${found.map(foundTask => foundTask.imageName).join(',')} tasks`)
			taskFoundCallback(found)
		}
	}
}