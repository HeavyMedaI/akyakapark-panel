import React from "react"
import { FormGroup, Input } from "reactstrap"
import { Menu, Search, Check, Info, Star, Trash } from "react-feather"
import PerfectScrollbar from "react-perfect-scrollbar"
import { connect } from "react-redux"
import {
  getTodos,
  completeTask,
  starTask,
  importantTask,
  trashTask,
  searchTask
} from "../../../../redux/actions/todo/index"
import Checkbox from "../../../../components/@vuexy/checkbox/CheckboxesVuexy"
class TodoList extends React.Component {

  render() {
    const { list } = this.props
    return (
      <div className="content-right" style={{ width: "100%" }}>
        <div className="todo-app-area">
          <div className="todo-app-list-wrapper">
            <div className="todo-app-list">
              <PerfectScrollbar
                className="todo-task-list"
                options={{
                  wheelPropagation: false
                }}
              >
                <ul className="todo-task-list-wrapper">
                {list.length > 0 ? (
                  list.map((todo, i) => {
                    return (
                      <li
                        className={`todo-item`}
                        key={i}
                      >
                        <div className="todo-title-wrapper d-flex justify-content-between mb-50">
                          <div className="todo-title-area d-flex align-items-center">
                            <div className="title-wrapper d-flex">
                              <h6 className="todo-title mt-50 mx-50">{todo.username}</h6>
                            </div>
                          </div>
                          <div
                            className={`todo-item-action d-flex justify-content-end`}>
                            <div
                              className="todo-item-delete d-inline-block mr-1 mr-sm-0"
                              onClick={e => {
                                e.stopPropagation()
                                this.props.onDelete(todo.id)
                              }}
                            >
                              <Trash size={17} />
                            </div>
                          </div>
                        </div>
                        <p className="todo-desc truncate mb-0">{todo.message}</p>
                      </li>
                    )
                  })
                ) : (
                  <p className="p-1 text-center mt-2 font-medium-3 text-bold-500">
                    Yardım talebi bulunmamaktadır
                  </p>
                )}                
                </ul>
              </PerfectScrollbar>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
const mapStateToProps = state => {
  return {
    app: state.todoApp
  }
}
export default connect(mapStateToProps, {
  getTodos,
  completeTask,
  starTask,
  importantTask,
  trashTask,
  searchTask
})(TodoList)
