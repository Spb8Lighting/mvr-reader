export const tableSettings = {
  fixture: {
    withLayer: {
      headings: ['Layer', 'Fixture Manufacturer', 'Fixture Model', 'Fixture Spec', 'Fixture Mode', 'Fixture ID', 'Fixture Unit Number', 'Fixture Rotation', 'Fixture Translation', 'Fixture Address', 'Fixture DMX Universe', 'Fixture DMX Address'],
      settings: {
        perPageSelect: [200, 300, 400, 500, 1000],
        perPage: 200,
        columns: [
          { select: 9, sort: 'asc' },
          { select: 9, hidden: true }
        ]
      }
    },
    withoutLayer: {
      headings: ['Fixture Manufacturer', 'Fixture Model', 'Fixture Spec', 'Fixture Mode', 'Fixture ID', 'Fixture Unit Number', 'Fixture Rotation', 'Fixture Translation', 'Fixture Address', 'Fixture DMX Universe', 'Fixture DMX Address'],
      settings: {
        perPageSelect: [200, 300, 400, 500, 1000],
        perPage: 200,
        columns: [
          { select: 8, sort: 'asc' },
          { select: 8, hidden: true }
        ]
      }
    }
  },
  objects: {
    withLayer: {
      headings: ['Layer', 'Fixture Manufacturer', 'Fixture Rotation', 'Fixture Translation'],
      settings: {
        perPageSelect: [200, 300, 400, 500, 1000],
        perPage: 200
      }
    },
    withoutLayer: {
      headings: ['Fixture Manufacturer', 'Fixture Rotation', 'Fixture Translation'],
      settings: {
        perPageSelect: [200, 300, 400, 500, 1000],
        perPage: 200
      }
    }
  }
}