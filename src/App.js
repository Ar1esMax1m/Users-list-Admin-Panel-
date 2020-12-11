import React from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import "../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import "./App.scss";

// функция проверки локального хранилища на существующие элементы
function checkLocalStorage() {
  let items = [];

  if (!localStorage.getItem("items")) {
    for (let i = 0; i < 100; ++i) {
      items[i] = {
        id: i,
        name: "Max " + i,
        status: 0,
        email: "ar1esmax1mwork@gmail.com",
        tel: "89873520883",
        pass: "123456789",
        expand: [{ dateCreate: getDate(), dateChange: "" }],
      };
    }
    localStorage.setItem("items", JSON.stringify(items));
  } else {
    items = JSON.parse(localStorage.getItem("items"));
  }
  return items;
}

// функция для получения даты, которая в дальнейшем используется для обновления данных:
// дата создания; дата изменения;
function getDate() {
  let date = new Date();
  return date.toString();
}

// стандартный компонент, в который был добавлен статичный title.
class App extends React.Component {
  render() {
    return (
      <div className="App">
        <div className="content-wrapper">
          <div className="title">Admin-Panel</div>
          <AdminPanel
            data={checkLocalStorage()}
            rootUpdate={this.forceUpdate.bind(this)}
          />
        </div>
      </div>
    );
  }
}

// функция, возвращающая результат валидации (объект)
// вынес код, дабы не писать одно и тоже несколько раз
function responseValidator(isValid, type, msg, title) {
  return {
    isValid: isValid,
    notification: { type: type, msg: msg, title: title },
  };
}

// Админ-панель
class AdminPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { items: this.props.data };

    this.afterSaveCell = this.afterSaveCell.bind(this);
    this.onDeleteRow = this.onDeleteRow.bind(this);
    this.onInsertRow = this.onInsertRow.bind(this);
  }

  /* обновление хранилиша */
  afterSaveCell(oldValue, newValue, row, column) {
    if (oldValue !== newValue) {
      let index = this.state.items.indexOf(oldValue);
      console.log();
      this.state.items[index].expand[0].dateChange = getDate();
      localStorage.setItem("items", JSON.stringify(this.state.items));
    }
  }

  onInsertRow(row) {
    row.expand = [{ dateCreate: getDate(), dateChange: "" }];
    this.state.items.push(row);
    localStorage.setItem("items", JSON.stringify(this.state.items));
  }

  onDeleteRow(rowKeys) {
    for (let i = 0; i != rowKeys.length; i++) {
      this.state.items = this.state.items.filter((item) => {
        return item.id !== rowKeys[i];
      });
    }
    localStorage.setItem("items", JSON.stringify(this.state.items));
  }
  /* .обновление хранилища. */

  // функция раскрытия скрытой таблицы
  expandRow(row) {
    return <ExpandTable data={row.expand} />;
  }

  /* методы валидации */
  // жёсткую валидацию не делал,
  // но вполне можно сделать более сложную валидацию полей
  emptyValidator(value) {
    if (!value) {
      return responseValidator(
        false,
        "error",
        "Поле не может быть пустым!",
        "Ошибка"
      );
    } else {
      return responseValidator(true, "success");
    }
  }

  telValidator(value) {
    if (value.length !== 11) {
      return responseValidator(
        false,
        "error",
        "Номер должен содержать 11 символов",
        "Ошибка"
      );
    } else {
      return responseValidator(true, "success");
    }
  }

  passwordValidator(value) {
    if (value.length < 8 || value.length > 16) {
      return responseValidator(
        false,
        "error",
        "Пароль должен содержать от 8 до 16 символов",
        "Ошибка"
      );
    } else {
      return responseValidator(true, "success");
    }
  }
  /* .методы валидации. */

  // Фильтрация и поиск
  enumFormatter(cell, row, enumObject) {
    return enumObject[cell];
  }

  render() {
    // необходимые параметры для работы таблицы
    const options = {
      page: 1,
      prePage: "⟵",
      nextPage: "⟶",
      firstPage: "⟸",
      lastPage: "⟹",
      afterInsertRow: this.onInsertRow,
      afterDeleteRow: this.onDeleteRow,
    };

    const selectRowProp = {
      mode: "checkbox",
      clickToSelect: false,
      clickToExpand: true,
    };

    const cellEditProp = {
      mode: "dbclick",
      afterSaveCell: this.afterSaveCell,
    };

    const statusUser = [0, 1, 2];

    const statusUserType = {
      0: "Client",
      1: "Partner",
      2: "Admin",
    };

    // основная таблица
    return (
      <BootstrapTable
        data={this.props.data}
        expandableRow={() => {
          return true;
        }}
        expandComponent={this.expandRow}
        expandColumnOptions={{ expandColumnVisible: true }}
        options={options}
        pagination={true}
        insertRow={true}
        deleteRow={true}
        selectRow={selectRowProp}
        cellEdit={cellEditProp}
        search={true}
        multiColumnSearch={true}
      >
        <TableHeaderColumn
          isKey
          dataField="id"
          width="70"
          headerAlign="center"
          dataAlign="center"
          searchable={false}
        >
          ID
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="name"
          headerAlign="center"
          dataAlign="center"
          editable={{ type: "text", validator: this.emptyValidator }}
          searchable={false}
        >
          ФИО
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="status"
          headerAlign="center"
          dataAlign="center"
          editable={{
            type: "select",
            options: { values: statusUser, validator: this.emptyValidator },
          }}
          filterFormatted
          dataFormat={this.enumFormatter}
          formatExtraData={statusUserType}
          filter={{
            type: "SelectFilter",
            options: statusUserType,
            defaultValue: 0,
          }}
          searchable={false}
        >
          Статус
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="email"
          headerAlign="center"
          dataAlign="center"
          editable={{ type: "email", validator: this.emptyValidator }}
        >
          Почта
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="tel"
          headerAlign="center"
          dataAlign="center"
          editable={{ type: "tel", validator: this.telValidator }}
        >
          Телефон
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="pass"
          headerAlign="center"
          dataAlign="center"
          editable={{ type: "password", validator: this.passwordValidator }}
          searchable={false}
        >
          Пароль
        </TableHeaderColumn>
      </BootstrapTable>
    );
  }
}

// скрытая таблица
class ExpandTable extends React.Component {
  render() {
    if (this.props.data) {
      return (
        <BootstrapTable data={this.props.data} trClassName="expand-table">
          <TableHeaderColumn
            dataField="dateCreate"
            isKey={true}
            headerAlign="center"
            dataAlign="center"
            editable={{ type: "datetime" }}
          >
            Дата создания
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="dateChange"
            headerAlign="center"
            dataAlign="center"
            editable={{ type: "datetime" }}
          >
            Дата изменения
          </TableHeaderColumn>
        </BootstrapTable>
      );
    } else {
      return <p>Пусто!</p>;
    }
  }
}

export default App;
