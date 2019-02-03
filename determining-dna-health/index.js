
/**
 * Aho–Corasick algorithm
 * https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_algorithm
 */
var AhoCorasick, Trie;

Trie = (function () {

	function Trie() {
		this.next = {};
		this.is_word = null;
		this.value = null;
		this.data = [];
	}

	Trie.prototype.add = function (word, data, original_word) {
		var chr, node;
		chr = word.charAt(0);
		node = this.next[chr];
		if (!node) {
			node = this.next[chr] = new Trie();
			if (original_word) {
				node.value = original_word.substr(0, original_word.length - word.length + 1);
			} else {
				node.value = chr;
			}
		}
		if (word.length > 1) {
			return node.add(word.substring(1), data, original_word || word);
		} else {
			node.data.push(data);
			return node.is_word = true;
		}
	};

	const cacheExploreFailLinks = {}
	Trie.prototype.explore_fail_link = function (word) {
		var chr, i, node, _i, _ref;
		node = this;

		console.log(word)

		const preWord = word.substr(0, word.length - 1)
		if (typeof cacheExploreFailLinks[preWord] !== 'undefined') {
			if (cacheExploreFailLinks[preWord]) {
				node = cacheExploreFailLinks[preWord]
				chr = word.charAt(word.length - 1);
				node = node.next[chr];
				if (!node) {
					node = null;
				}
			} else {
				node = null
			}
		} else {
			for (i = _i = 0, _ref = word.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
				chr = word.charAt(i);
				node = node.next[chr];
				if (!node) {
					node = null;
					break;
				}
			}
		}
		cacheExploreFailLinks[word] = node;
		return node;
	};

	Trie.prototype.each_node = function (callback) {
		var node, _k, _ref, _ref1;
		_ref = this.next;
		for (_k in _ref) {
			node = _ref[_k];
			callback(this, node);
		}
		_ref1 = this.next;
		for (_k in _ref1) {
			node = _ref1[_k];
			node.each_node(callback);
		}
		return this;
	};

	return Trie;

})();

AhoCorasick = (function () {

	function AhoCorasick() {
		this.trie = new Trie();
	}

	AhoCorasick.prototype.add = function (word, data) {
		return this.trie.add(word, data);
	};

	AhoCorasick.prototype.build_fail = function (node) {
		var fail_node, i, sub_node, _i, _k, _ref, _ref1;
		node = node || this.trie;
		node.fail = null;
		if (node.value) {
			for (i = _i = 1, _ref = node.value.length; 1 <= _ref ? _i < _ref : _i > _ref; i = 1 <= _ref ? ++_i : --_i) {
				fail_node = this.trie.explore_fail_link(node.value.substring(i));
				if (fail_node) {
					node.fail = fail_node;
					break;
				}
			}
		}
		_ref1 = node.next;
		for (_k in _ref1) {
			sub_node = _ref1[_k];
			this.build_fail(sub_node);
		}
		return this;
	};

	AhoCorasick.prototype.foreach_match = function (node, pos, callback) {
		var offset;
		while (node) {
			if (node.is_word) {
				offset = pos - node.value.length;
				callback(node.value, node.data, offset);
			}
			node = node.fail;
		}
		return this;
	};

	AhoCorasick.prototype.search = function (string, callback) {
		var chr, current, idx, _i, _ref;
		current = this.trie;
		for (idx = _i = 0, _ref = string.length; 0 <= _ref ? _i < _ref : _i > _ref; idx = 0 <= _ref ? ++_i : --_i) {
			chr = string.charAt(idx);
			while (current && !current.next[chr]) {
				current = current.fail;
			}
			if (!current) {
				current = this.trie;
			}
			if (current.next[chr]) {
				current = current.next[chr];
				if (callback) {
					this.foreach_match(current, idx + 1, callback);
				}
			}
		}
		return this;
	};

	AhoCorasick.prototype.to_dot = function () {
		var dot, fail_cb, last_chr, link_cb, v_;
		dot = ['digraph Trie {'];
		v_ = function (node) {
			if (node && node.value) {
				return "\"" + node.value + "\"";
			} else {
				return "\"\"";
			}
		};
		last_chr = function (str) {
			if (str) {
				return str.charAt(str.length - 1);
			}
		};
		link_cb = function (from, to) {
			var k, option, to_label, to_opt, v;
			to_label = last_chr(to.value);
			to_opt = ["label = \"" + to_label + "\""];
			if (to.is_word) {
				option = {
					style: 'filled',
					color: 'skyblue'
				};
				for (k in option) {
					v = option[k];
					to_opt.push("" + k + " = \"" + v + "\"");
				}
			}
			dot.push("" + (v_(from)) + " -> " + (v_(to)) + ";");
			dot.push("" + (v_(to)) + " [ " + (to_opt.join(',')) + " ];");
			return fail_cb(from, to);
		};
		fail_cb = function (from, to) {
			var style, _ref;
			_ref = [to, to.fail], from = _ref[0], to = _ref[1];
			style = to ? 'dashed' : 'dotted';
			return dot.push("" + (v_(from)) + " -> " + (v_(to)) + " [ style = \"" + style + "\" ];");
		};
		this.trie.each_node(link_cb);
		dot.push('}');
		return dot.join("\n");
	};

	return AhoCorasick;

})();

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

process.stdin.resume()
process.stdin.setEncoding('utf-8')

let inputString = ''
let currentLine = 0

process.stdin.on('data', inputStdin => {
	inputString += inputStdin
})

process.stdin.on('end', _ => {
	inputString = inputString.replace(/\s*$/, '')
		.split('\n')
		.map(str => str.replace(/\s*$/, ''))

	main()
})

function readLine() {
	return inputString[currentLine++]
}


function main() {
	let min = Infinity
	let max = -Infinity

	const n = parseInt(readLine(), 10)

	const genes = readLine().split(' ')

	const health = readLine().split(' ').map(healthTemp => parseInt(healthTemp, 10))

	const s = parseInt(readLine(), 10)

	// Genes Map with accumulated health	
	const genesLinesMap = new Map()
	ac = new AhoCorasick()
	console.log(`add words`);
	for (let i = 0; i < genes.length; i++) {
		const gen = genes[i]
		if (!genesLinesMap.has(gen)) {
			genesLinesMap.set(gen, [])
			ac.add(gen)
		}
		genesLinesMap.get(gen).push(i)
	}
	console.log(`Before build_fail`);
	ac.build_fail()

	// DEBUG
	let used = process.memoryUsage().heapUsed / 1024 / 1024;
	console.log(`The script uses approximately ${used} MB`);

	for (let sItr = 0; sItr < s; sItr++) {
		const firstLastd = readLine().split(' ')

		const first = parseInt(firstLastd[0], 10)

		const last = parseInt(firstLastd[1], 10)

		const d = firstLastd[2]

		let totalHealth = 0
		const cacheTotalHealth = {}
		ac.search(d, foundGen => {
			if (!cacheTotalHealth[foundGen]) {
				const genLinesList = genesLinesMap.get(foundGen)
				let genTocalHealth = 0
				for (let i = 0; i < genLinesList.length; i++) {
					const genIndex = genLinesList[i]
					if (genIndex < first) continue
					if (genIndex > last) break // not necessary to continue
					genTocalHealth += health[genIndex]
				}
				cacheTotalHealth[foundGen] = genTocalHealth
			}
			totalHealth += cacheTotalHealth[foundGen]
		})

		if (totalHealth < min) {
			min = totalHealth
		}

		if (totalHealth > max) {
			max = totalHealth
		}

		// console.log(sItr, s) // DEBUG time trace
	}

	// Print solution
	console.log(`${min} ${max}`)
}
