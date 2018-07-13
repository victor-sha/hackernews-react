import React, { Component } from 'react';
import PropTypes from 'prop-types';
import fetch from 'isomorphic-fetch';
import './App.css';

const DEFAULT_QUERY = 'react';
const PATH_BASE = 'https://newsapi.org/v2/everything?';
const PARAM_FILTER = '&from=2018-07-11&sortBy=popularity&language=en';
const PARAM_PAGE = '&page=';
const NEWS_API_KEY = '&apiKey=854a2bc904194751a039760d10b0aa55';
const get_url = (searchTerm, page = 1) => `${PATH_BASE}q=${searchTerm}${PARAM_FILTER}${PARAM_PAGE}${page}${NEWS_API_KEY}`;


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      results: null,
      page: 1,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null
    }

    this.needToSearchTopStories = this.needToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  needToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  setSearchTopStories(result, page) {
    const { articles } = result;
    const { searchKey, results } = this.state;
    const oldArticles = results && results[searchKey]
          ? results[searchKey].articles
          : [];
    const updatedArticles = [
      ...oldArticles,
      ...articles
    ];
    this.setState({
      results: {
        ...results,
        [searchKey]: { articles: updatedArticles, page}
      },
      page
    });
  }

  fetchSearchTopStories(searchTerm, page = 1) {
    fetch(get_url(searchTerm, page))
      .then(res => res.json())
      .then(result => this.setSearchTopStories(result, page))
      .catch(e => this.setState({error: e}));
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  onDismiss(url) {
    const { searchKey, results } = this.state;
    const { articles, page } = results[searchKey];
    const updatedList =  articles.filter(item => item.url !== url);
    this.setState({
      results: { 
        ...results, 
        [searchKey]: updatedList, page }
    });
  }

  onSearchChange = (event) => {
    this.setState({ searchTerm: event.target.value, page: 1 });
  }

  onSearchSubmit = (event) => {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    if (this.needToSearchTopStories(searchTerm))
      this.fetchSearchTopStories(searchTerm);
    event.preventDefault();
  }

  render() {
    const {  searchTerm, results, searchKey, error } = this.state;
    const page = (
      results 
      && results[searchKey]
      && results[searchKey].page
    ) || 1;
    const list = (
      results
      && results[searchKey]
      && results[searchKey].articles
    ) || [];

    return (
      <div className="page">
        <div className="interactions">
          <Search 
            value = {searchTerm}
            onChange = {this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
          {error
          ? <div className="interaction">
              <p>Something went wrong</p>
            </div>
          : <Table
              list={list}
              onDismiss={this.onDismiss}
          />}
          <div className="interactions">
            <Button
              onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}
            >
              More
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

const Search = ({ value, onChange, children, onSubmit }) => 
      <form onSubmit={onSubmit}>
        <input 
          type="text"
          value={value}  
          onChange={onChange}
        />
        <button type="submit">
          {children}
        </button>
      </form>

Search.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired
}
const Table = ({ list, onDismiss }) =>
      <div className="table">
        {list.map(item => 
          <div key = {item.url} className="table-row" >
            <span 
              style={{ width: '60%' }}
              className="tooltip"
            >
              <span className="tooltiptext"><img alt='' src={item.urlToImage}/></span>
              <a href={item.url}>{item.title}</a>
            </span>
            <span style={{ width: '30%' }}>
              {item.author}
            </span>
            <span style={{ width: '10%' }}>
                <Button onClick={() => onDismiss(item.url)}
                        className="button-inline"
                >
                  Dismiss
                </Button>
              </span>
          </div>
        )}
      </div>

Table.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      author: PropTypes.string,
      url: PropTypes.string,
      title: PropTypes.string.isRequired
    })
  ).isRequired,
  onDismiss: PropTypes.func.isRequired
}

const Button = ({children, onClick, className=''}) => 
  <button 
    onClick={onClick} 
    className={className} 
  >
    {children}
  </button>

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired
}  

export default App;

export {
  Table,
  Search,
  Button
};
