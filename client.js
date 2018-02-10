const localDB = new PouchDB('projects')
const remoteDB = new PouchDB('config goes here')

class Navigator extends React.Component {
  constructor () {
    super()

    const sync = PouchDB.sync(localDB, remoteDB, {
      live: true,
      retry: true
    }).on('change', (info) => {
      console.log("SYNC CHANGE", info);
      this.getDocs()
      this.forceUpdate()
    }).on('paused', (err) => {
      console.log("SYNC PAUSE", err);
      this.setState({syncing: false});
    }).on('active', () => {
      console.log("SYNC ACTIVE");
      this.setState({syncing: true});
    }).on('denied', (err) => {
      console.log("SYNC DENIED", err);
    }).on('complete', (info) => {
      console.log("SYNC COMPLETE", info);
    }).on('error', (err) => {
      console.log("SYNC ERROR", err);
    });

    this.state = {
      syncing: false,
      chunked: [],
      selectedId: 'express-rosegardens'
    }
  }

  async getWithFallback(id) {
    try {
      return await localDB.get(id)
    } catch (e) {
      console.error("Falling back (one)")
      const doc = await remoteDB.get(id)
      PouchDB.replicate(remoteDB, localDB, {
        retry: true,
        doc_ids: [id]
      })
      return doc
    }
  }

  async getAllDocsWithFallback(opts) {
      const response = await localDB.allDocs(opts)
      if (response.rows.filter(r => r.doc === undefined).length !== 0) {
        console.error("Falling back (all docs)")
        const response = await remoteDB.allDocs(opts)
        PouchDB.replicate(remoteDB, localDB, {
          retry: true,
          doc_ids: response.rows.map(row => row.doc.id)
        })
        return response
      } else {
        return response;
      }
  }

  async getDocs () {
    const entry = await this.getWithFallback(this.state.selectedId)
    let parent;
    const parentId = entry.ancestors[entry.ancestors.length - 1];
    const childrenIds = entry.tree;

    const response = await this.getAllDocsWithFallback({include_docs: true, keys: childrenIds});
    const children = response.rows.filter(r => r.doc !== undefined).map(r => r.doc);

    if (parentId) {
       parent = await this.getWithFallback(parentId);
       this.setState({ chunked: [entry, parent, ...children]});
    } else {
       this.setState({ chunked: [entry, ...children]});
    }
  }

  componentDidMount () {
    this.getDocs()
  }

  select (id) {
    this.setState({selectedId: id}, () => {
      this.getDocs()
    })
  }

  render() {
    const { syncing, selectedId, chunked } = this.state
    const entry = chunked.find(e => e.id === selectedId)
    const isRoot = entry && entry.ancestors.length === 0
    const parentId = entry && entry.ancestors[entry.ancestors.length - 1]
    const parent = chunked.find(e => e.id === parentId)
    const children = entry && entry.tree.map(id => chunked.find(e => e.id === id))

    return <div>
      <h1>Navigator{syncing && <span> - SYNCING...</span>}</h1>
      {!isRoot && <button onClick={() => this.select(parentId)}>
          {parent
            ? parent.meta.name
            : <span style={{ color: 'blue' }}>loading</span>}
        </button>
      }
      <h2 style={{ margin: 20 }}>{
        entry
        ? entry.meta.name
        : <span style={{ color: 'blue' }}>loading</span>
      }
      </h2>
      <div style={{ margin: 40 }}>
        {children && children.map(child =>
          <div>
            <button onClick={() => this.select(child.id)}>
              {child
                ? child.meta.name
                : <span style={{ color: 'blue' }}>loading</span>}
              </button>
          </div>
        )}
      </div>
    </div>
  }
}

ReactDOM.render(
  <Navigator />,
  document.getElementById('root')
)
