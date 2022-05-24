import React from "react"
import Sidebar from "react-sidebar"
import { ContextLayout } from "../../../../utility/context/Layout"
import TodoSidebar from "./TodoSidebar"
import TodoList from "./TodoList"
import TaskSidebar from "./TaskSidebar"
import "../../../../assets/scss/pages/app-todo.scss"
const mql = window.matchMedia(`(min-width: 992px)`)

class TODO extends React.Component {
  state = {
    addTask: false,
    sidebarDocked: mql.matches,
    sidebarOpen: false,
    taskToUpdate: null,
    prevState: null
  }
  UNSAFE_componentWillMount() {
    mql.addListener(this.mediaQueryChanged)
  }

  componentWillUnmount() {
    mql.removeListener(this.mediaQueryChanged)
  }

  onSetSidebarOpen = open => {
    this.setState({ sidebarOpen: open })
  }

  mediaQueryChanged = () => {
    this.setState({ sidebarDocked: mql.matches, sidebarOpen: false })
  }

  handleAddTask = status => {
    status === "open"
      ? this.setState({ addTask: true })
      : this.setState({ addTask: false, taskToUpdate: null })
  }
  handleUpdateTask = todo => {
    if (todo !== undefined) {
      this.setState({ addTask: true, taskToUpdate: todo })
    } else {
      this.setState({ taskToUpdate: null })
    }
  }

  handleUndoChanges = arr => {
    this.setState({
      prevState: arr
    })
  }

  render() {
    return (
      <div className="todo-application position-relative">
        <TodoList
          routerProps={this.props}
          list={this.props.list}
          handleUpdateTask={this.handleUpdateTask}
          mainSidebar={this.onSetSidebarOpen}
          prevState={this.state.prevState}
          onDelete={this.props.onDelete}
        />
      </div>
    )
  }
}

export default TODO
