import * as React from "react";
import Modal from "react-modal";

export interface ModalSelectValue<T> {
  search: string;
  value: T;
}

export interface ModalSelectCategory<T> {
  name: string;
  options: Array<ModalSelectValue<T>>;
}

interface ModalSelectProps<T> {
  onChange: (selection: T) => void;
  disabled?: boolean;
  value: T;
  formatOptionLabel: (data: T) => React.ReactNode;
  options: Array<ModalSelectCategory<T>>;
  optionsFilter?: (data: T) => boolean;
}

interface ModalSelectState {
  filtering: string;
  modalOpen: boolean;
}

export class ModalSelectCategorized<T>
    extends React.PureComponent<ModalSelectProps<T>, ModalSelectState> {
  private filterRef = React.createRef<HTMLInputElement>();

  constructor(props: ModalSelectProps<T>) {
    super(props);

    this.state = {
      filtering: "",
      modalOpen: false,
    };
  }

  handleOnChange = (event: any) => {
    event.preventDefault();
    this.toggleModal();
    const cindex = parseInt(event.currentTarget.dataset.cindex, 10);
    const oindex = parseInt(event.currentTarget.dataset.oindex, 10);
    this.props.onChange(this.props.options[cindex].options[oindex].value);
  }

  handleFilteringChange = (event: any) => {
    event.preventDefault();
    this.setState({ filtering: event.target.value });
  }

  optionsFilter = (item: ModalSelectValue<T>) => {
    if (!item.search.toLowerCase().includes(this.state.filtering.toLowerCase()))
      return false;
    if (!this.props.optionsFilter)
      return true;
    return this.props.optionsFilter(item.value);
  }

  toggleModal = () => {
    this.setState({ modalOpen: !this.state.modalOpen });
  }

  focusSearch = () => {
    if (this.filterRef.current)
      this.filterRef.current.focus();
  }

  render() {
    const props = this.props,
      state = this.state;

    return (
      <>
        <button type="button" className="btn btn-light"
            style={{ width: "100%" }}
            disabled={props.disabled}
            onClick={this.toggleModal}>
          {props.children || props.formatOptionLabel(props.value)}
        </button>
        <Modal isOpen={this.state.modalOpen}
            className="modal-dialog modal-xl modal-dialog-centered"
            ariaHideApp={false}
            onRequestClose={this.toggleModal}
            onAfterOpen={this.focusSearch}>
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-group">
                <input type="text" className="form-control"
                    ref={this.filterRef}
                    value={state.filtering}
                    onChange={this.handleFilteringChange} />
              </div>
              {props.options.map(({ name, options }, cindex) =>
              <div className="form-group" key={cindex}>
                <h3>{name}</h3>
                <div className="form-row">
                  {options.map((item, oindex) =>
                  <div className="form-group col-2" key={oindex}
                    style={{ display: this.optionsFilter(item) ? "block" : "none" }}>
                    <button key={oindex} type="button" className="btn btn-light"
                        style={{ width: "100%" }}
                        onClick={this.handleOnChange}
                        data-cindex={cindex}
                        data-oindex={oindex}>
                      {(props.formatOptionLabel)(item.value)}
                    </button>
                  </div>
                  )}
                </div>
              </div>
              )}
            </div>
          </div>
        </Modal>
      </>
    );
  }
}
