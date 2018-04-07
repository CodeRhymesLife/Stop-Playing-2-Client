import delay from 'delay'
import tasklist from 'tasklist'

import Monitor from '../src/monitor'

jest.mock('tasklist')

// A list of the monitors that have been created
let monitors = []

beforeEach(() => monitors = [])

afterEach(() => {
	// Stop any monitors that are running
	monitors.forEach((monitor) => {
		if(monitor.isRunning)
			monitor.stop()
	})
})

// Save monitors that are created so we can make sure they're stopped afterward
const createMonitor = (options) => {
	const monitor = new Monitor(options)
	monitors.push(monitor)
	return monitor
}

describe('start tests', () => {
	
	test('return task -- check for task -- find task', async () => {
		// -- Setup
		const task = 'someTask'
		const interval = 100
		const taskFoundCallback = jest.fn()
		const monitor = createMonitor({
			watchList: [task],
			interval,
			taskFoundCallback,
		})

		// return the task from tasklist
		tasklist.tests.setTasks([task])

		// -- Run
		monitor.start()

		// -- Check
		await delay(interval + 1)
		
		// Make sure the callback was called
		expect(taskFoundCallback.mock.calls.length).toBe(1)
		
		// Make sure the returned values are valid
		const returnedTasks = taskFoundCallback.mock.calls[0][0]
		expect(returnedTasks.length).toBe(1)
		expect(returnedTasks[0].imageName).toBe(task)
	})

	test('return task with capital -- check for task with lowercase -- find task', async () => {
		// -- Setup
		const task = 'SOMETASK'
		const interval = 100
		const taskFoundCallback = jest.fn()
		const monitor = createMonitor({
			watchList: [task],
			interval,
			taskFoundCallback,
		})

		// return the task from tasklist
		tasklist.tests.setTasks([task.toLowerCase()])

		// -- Run
		monitor.start()

		// -- Check
		await delay(interval + 1)
		
		// Make sure the callback was called
		expect(taskFoundCallback.mock.calls.length).toBe(1)
		
		// Make sure the returned values are valid
		const returnedTasks = taskFoundCallback.mock.calls[0][0]
		expect(returnedTasks.length).toBe(1)
		expect(returnedTasks[0].imageName).toBe(task.toLowerCase())
	})

	test('return task -- check for different task -- do not find task', async () => {
		// -- Setup
		const task = 'someTask'
		const interval = 100
		const taskFoundCallback = jest.fn()
		const monitor = createMonitor({
			watchList: [task],
			interval,
			taskFoundCallback,
		})

		// return the task from tasklist
		tasklist.tests.setTasks(['someOtherTask'])

		// -- Run
		monitor.start()

		// -- Check
		await delay(interval + 1)
		
		// Make sure the callback was not called
		expect(taskFoundCallback.mock.calls.length).toBe(0)
	})

	test('return task -- check for task before its ready -- do not find task', async () => {
		// -- Setup
		const task = 'someTask'
		const interval = 100
		const taskFoundCallback = jest.fn()
		const monitor = createMonitor({
			watchList: [task],
			interval,
			taskFoundCallback,
		})

		// return the task from tasklist
		tasklist.tests.setTasks([task])

		// -- Run
		monitor.start()

		// -- Check
		const tooSoonInterval = interval / 2
		await delay(tooSoonInterval)
		
		// Make sure the callback was called
		expect(taskFoundCallback.mock.calls.length).toBe(0)
	})

	test('return multiple tasks -- some tasks are not in the watch list -- only watch list tasks found', async () => {
		// -- Setup
		const tasks = ['1', '2', '3']
		const interval = 100
		const taskFoundCallback = jest.fn()
		const monitor = createMonitor({
			watchList: tasks,
			interval,
			taskFoundCallback,
		})

		// return the task from tasklist
		tasklist.tests.setTasks(['3', '4', '1', '0'])

		// -- Run
		monitor.start()

		// -- Check
		await delay(interval + 1)
		
		// Make sure the callback was not called
		expect(taskFoundCallback.mock.calls.length).toBe(1)

		const returnedTasks = taskFoundCallback.mock.calls[0][0]
		
		const foundTasks = ['1', '3']
		expect(returnedTasks.length).toBe(foundTasks.length)

		const foundTasksInReturnedTasks = returnedTasks.filter(returnedTask => foundTasks.includes(returnedTask.imageName))
		expect(foundTasksInReturnedTasks.length).toBe(foundTasks.length)
	})

})

describe('isRunning tests', () => {
	test('check isRunning without start -- is running should not be set -- isRunning is false', () => {
		// -- Setup
		const monitor = createMonitor()

		// -- Run
		// nothing

		// -- Test
		expect(monitor.isRunning).toBe(false)
	})

	test('check isRunning after start -- is running should be set -- isRunning is true', () => {
		// -- Setup
		const monitor = createMonitor()

		// -- Run
		monitor.start()

		// -- Test
		expect(monitor.isRunning).toBe(true)
	})
})

describe('stop tests', () => {
	test('call stop without start -- stop called -- stop returns false', () => {
		// -- Setup
		const monitor = createMonitor()

		// -- Run
		const stoppedChecking = monitor.stop()

		// -- Test
		expect(stoppedChecking).toBe(false)
	})

	test('call start then stop -- stop called -- stop returns true', () => {
		// -- Setup
		const monitor = createMonitor()

		// -- Run
		monitor.start()
		const stoppedChecking = monitor.stop()

		// -- Test
		expect(stoppedChecking).toBe(true)
	})
})