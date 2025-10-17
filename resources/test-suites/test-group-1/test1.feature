Feature: Test N01

  Scenario: User Posts Report
    * def group =
      """
      function(list,groupbyKey){
        const group = {}

        for(const item of list){
          const id = item[groupbyKey];
          if(group[id] === undefined){
            group[id] = [];
          }
          group[id].push(item);
        }
        return group;
      }
      """
    Given url 'https://jsonplaceholder.typicode.com/posts/'
    When method get
    Then status 200
    * def posts = group(response,'userId')

    Given url 'https://jsonplaceholder.typicode.com/users'
    When method get
    Then status 200
    * def users = group(response,'id')
    * def uiVars = {posts:  '#(posts)', users: '#(users)' , testContext: '#(testContext)' }
    * render.accept('users',uiVars)
