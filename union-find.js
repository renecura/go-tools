class UnionFind {



  constructor(predicate) {
    this.size = 0;
    this.ids = [];
    this.ranks = [];
    this.groups = 0;
    this.map = [];

    this.predicate = predicate; // Unification condition
  }

  add(elem){
    this.map.push(elem);
    this.ids.push(this.size);
    this.ranks.push(1);
    this.size++;
    this.groups++;

    // Unify with the elements that satisfy the given predicate.
    const p = this.size - 1;
    for(let q of this.map){
      if(this.predicate(elem,q))
        this.unify(p,this.map.indexOf(q));
    }

  }

  find(p){
    // Find the root component
    let root = p;
    while(root != this.ids[root])
      root = this.ids[root];

    // Compress the path
    while(p != root){
      let next = this.ids[p];
      this.ids[p] = root;
      p = next;
    }
    
    return root;
  }

  unify(p, q){

    console.log(`p: ${p}, q:${q}`);

    // find the groups
    const rootp = this.find(p);
    const rootq = this.find(q);

    console.log(`rootp: ${rootp}, rootq:${rootq}`);

    // If is the same group, exit.
    if(rootp == rootq) return;

    // 
    this.ids[rootp] = rootq;
    this.ranks[rootq] += this.ranks[rootp];

    this.groups--;
  }


  group(elem){
    const p = this.map.indexOf(elem);
    return this.find(p);
  }

  regroup(){
    let groups = {};
    for(let s of this.map){
      const g = this.group(s);
      if(!groups[g])
        groups[g] = [];
      groups[g].push(s);
    }
    return groups;
  }


}