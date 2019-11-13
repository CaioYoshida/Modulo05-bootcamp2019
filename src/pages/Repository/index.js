import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import { 
  Loading, 
  Owner, 
  IssueList, 
  ButtonList, 
  Button, 
  PaginationDiv, 
} from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string
      })
    }).isRequired
  }
  
  state = {
    repository: {},
    issues: [],
    loading: true,
    allIsActive: true,
    openIsActive: false,
    closedIsActive: false,
    whichIsActive: 'all',
    page: 1,
  }
  
  async componentDidMount() {
    this.handleAllIssues();
  }

  handleAllIssues = async () => {
    const { whichIsActive } = this.state;

    if (whichIsActive !== 'all') {
      this.setState({ page: 1, whichIsActive: 'all' });
    }
    
    this.setState(
      { 
        allIsActive: true, 
        openIsActive: false, 
        closedIsActive: false, 
      }
    )

    const { match } = this.props;

    const { page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'all',
          per_page: 5,
          page,
        }
      }),
    ])

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleOpenIssues = async () => {
    const { whichIsActive } = this.state;

    if (whichIsActive !== 'open') {
      this.setState({ page: 1, whichIsActive: 'open' });
    }

    this.setState(
      { 
        allIsActive: false, 
        openIsActive: true, 
        closedIsActive: false, 
      }
    )

    const { match } = this.props;

    const { page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 5,
          page,
        }
      }),
    ])

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleCLosedIssues = async () => {
    const { whichIsActive } = this.state;

    if (whichIsActive !== 'closed') {
      this.setState({ page: 1, whichIsActive: 'closed' });
    }
    
    this.setState(
      { 
        allIsActive: false, 
        openIsActive: false, 
        closedIsActive: true, 
      }
    )

    const { match } = this.props;

    const { page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'closed',
          per_page: 5,
          page,
        }
      }),
    ])

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handlePages = async (action) => {
    const { page, allIsActive, openIsActive, closedIsActive } = this.state;

    await this.setState({ 
      page: action === 'back'? page - 1 : page + 1 
    });

    if (allIsActive) {
      this.handleAllIssues();
    }

    if (openIsActive) {
      this.handleOpenIssues();
    }

    if (closedIsActive) {
      this.handleCLosedIssues();
    }
  }
  
  render() {
    const { repository, issues, loading, allIsActive, openIsActive, closedIsActive, page, whichIsActive } = this.state;

    if(loading) {
      return <Loading>Carregando</Loading>
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login}/>
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        
        <IssueList>
          <ButtonList>
            <Button active={allIsActive} onClick={() => this.handleAllIssues()}>Todos</Button>
            <Button active={openIsActive} onClick={() => this.handleOpenIssues()}>Abertos</Button>
            <Button active={closedIsActive} onClick={() => this.handleCLosedIssues()}>Fechados</Button>
          </ButtonList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login}/>
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
          <PaginationDiv>
            <button disabled={page == 1} onClick={() => this.handlePages('back')}>Anterior</button>
            <span>Página {page}</span>
            <button onClick={() => this.handlePages('next')}>Próxima</button>
          </PaginationDiv>
        </IssueList>

      </Container>
    );
  }
}
