let _tasks = []
const tasklist = jest.fn(() => Promise.resolve(_tasks))

tasklist.tests = {
	setTasks: function(taskNames) {
		_tasks = []

		if(!taskNames)
			return

		// Convert the name of the task
		// to a task object
		_tasks = taskNames.map(task => {
			return {
				imageName: task,
			}
		})
	}
}

export default tasklist
