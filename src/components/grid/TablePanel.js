import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import Button from 'react-bootstrap/lib/Button'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import InputGroup from 'react-bootstrap/lib/InputGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import localeUtil from 'keys-translations-manager-core/lib/localeUtil'
import ConfirmModal from './ConfirmModal'
import Mask from '../layout/Mask'
import configUtil from '../../configUtil'
var timer,searchValue;
export default class TablePanel extends React.Component {
	static propTypes = {
		reloaddata: React.PropTypes.bool,
		messages: React.PropTypes.object,
		CountActions: React.PropTypes.object.isRequired,
		TranslationActions: React.PropTypes.object.isRequired,
		ComponentActions: React.PropTypes.object.isRequired,
		translations: React.PropTypes.array
	};

	static contextTypes = {
		config: React.PropTypes.object
	};

	constructor(props, context) {
		super(props, context);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
		this.state = {
			windowHeight: 0
		};

		//https://gist.github.com/Restuta/e400a555ba24daa396cc
		this.handleResize = this.handleResize.bind(this);
	}

	componentDidMount() {
		window.addEventListener('resize', this.handleResize);
		this.loadData();
	}

	componentWillReceiveProps(nextProps) {
		const { reloaddata, translations } = nextProps;

		if (reloaddata) {
			this.loadData();
		}

		if (translations && translations !== this.props.translations) {
			nextProps.CountActions.loadCounts();
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
	}

	loadData() {
		this.props.TranslationActions.loadTranslations();
	}

	/* istanbul ignore next */
	handleResize() {
		this.setState({
			windowHeight: window.innerHeight
		});
	}

	onQuickFilterText(event) {
		var self=this;
		searchValue=event.target.value;
		if(timer){
			clearTimeout(timer);
		}
		timer=setTimeout(function(){
			self.refs.table.handleSearch(searchValue);
		},350)
	}

	showEditModal(data) {
		this.props.ComponentActions.showEditModal(data)
	}

	showConfirmModal(value, data) {
		this.refs.confirmModal.open(
			localeUtil.getMsg("ui.common.delete"),
			localeUtil.getMsg("ui.confirm.delete", data.key),
			this.removeTranslation.bind(this, value)
		);
	}

	removeTranslation(value) {
		this.props.TranslationActions.removeTranslation(value);
	}

	downloadCsv() {
		let url = configUtil.getHost() + "/api/download/csv"

		/* istanbul ignore next */
		location.href = url;
	}

	render() {
		const me = this,
			config = me.context.config,
			locales = config.locales,
			minHeight = 200,
			top = 370,
			windowHeight = this.state.windowHeight ||
						(typeof window === "undefined" ? minHeight + top : window.innerHeight);

		return (
			<div>
				<InputGroup>
					<InputGroup.Addon className="app-search-icon">
						<i className="fa fa-search"/>
					</InputGroup.Addon>
					<FormControl type="text" className="app-search-bar"
						placeholder={localeUtil.getMsg("ui.grid.search")}
						onChange={this.onQuickFilterText.bind(this)}/>
					<InputGroup.Button style={{"paddingLeft": "5px"}}>
						<Button onClick={this.downloadCsv}>
							<i className="fa fa-file-text-o"/> CSV
						</Button>
					</InputGroup.Button>
				</InputGroup>
				<BootstrapTable ref="table" data={this.props.translations || []}
						height={(windowHeight < (minHeight + top) ? minHeight : windowHeight - top) + ""}
						striped={true} hover={true} condensed={true}
						options={{
							noDataText: localeUtil.getMsg("ui.grid.empty")
						}}
						cellEdit={{
							mode: "dbclick",
							blurToSave: false,
							afterSaveCell: function(row/*, cellName, cellValue*/){
								me.props.TranslationActions.updateTranslation(row);
							}
						}}>

					<TableHeaderColumn width="50" dataField="_id" isKey={true} dataFormat={function(cell, row){
						return (
							<div>
								<Glyphicon glyph="edit" className="app-action-icon" title={localeUtil.getMsg("ui.common.edit")}
									onClick={me.showEditModal.bind(me, row)}/>
								<Glyphicon glyph="trash" className="app-action-icon" title={localeUtil.getMsg("ui.common.delete")}
									onClick={me.showConfirmModal.bind(me, cell, row)}/>
							</div>
						);
					}}>
						{localeUtil.getMsg("ui.common.action")}
					</TableHeaderColumn>

					<TableHeaderColumn width="100" editable={false} dataField="project" dataFormat={function(cell){
						const projectList = cell,
								l = projectList ? projectList.length : 0,
								getProjectName = configUtil.getProjectName;
						let i, project = [];
						for (i = 0; i < l; i++) {
							project.push( getProjectName(projectList[i]) );
						}
						return <div>{project.join(", ")}</div>
					}}>
						{localeUtil.getMsg("ui.common.applyto")}
					</TableHeaderColumn>

					<TableHeaderColumn width="100" editable={false} dataField="key" dataSort={true}>Key</TableHeaderColumn>

					<TableHeaderColumn width="100" editable={false} dataField="description">{localeUtil.getMsg("ui.common.desc")}</TableHeaderColumn>

					{locales.map(function(locale){
						return (
							<TableHeaderColumn key={locale} width="100" editable={true} dataField={locale} dataSort={true}>
								<span className="text-primary"><b>* </b></span>{`${localeUtil.getMsg("ui.common.locale")} / ${locale}`}
							</TableHeaderColumn>
						);
					})}
				</BootstrapTable>
				<Row>
					<Col xs={12}>
						<span className="text-primary"><b>( * )</b></span>
						{' '}
						<span className="text-primary">{localeUtil.getMsg("ui.grid.edit")}</span>
					</Col>
				</Row>
				<ConfirmModal ref="confirmModal"/>
				<Mask show={!this.props.translations}/>
			</div>
		);
	}
}
