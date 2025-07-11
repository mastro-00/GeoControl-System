# Project Estimation part 2
Goal of this document is to compare actual effort and size of the project, vs the estimates made in task1.

## Computation of size

To compute the lines of code use cloc    
To install cloc:  
      `npm install -g cloc`   
On Windows, also a perl interpreter needs to be installed. You find it here https://strawberryperl.com/  
To run cloc  
      `cloc <directory containing ts files> --include-lang=TypeScript`  
As a result of cloc collect the *code* value (rightmost column of the result table)  
        

Compute two separate values of size  
-LOC of production code     `cloc <Geocontrol\src> --include-lang=TypeScript`  
-LOC of test code      `cloc <GeoControl\test> --include-lang=TypeScript`

```
cloc src --include-lang=TypeScript
      48 text files.
      48 unique files.                              
       2 files ignored.

github.com/AlDanial/cloc v 2.04  T=0.03 s (1733.5 files/s, 91404.3 lines/s)
-------------------------------------------------------------------------------
Language                     files          blank        comment           code
-------------------------------------------------------------------------------
TypeScript                      48            308            409           1814
-------------------------------------------------------------------------------
SUM:                            48            308            409           1814
-------------------------------------------------------------------------------
```

```
cloc test --include-lang=TypeScript
      38 text files.
      38 unique files.                              
       4 files ignored.

github.com/AlDanial/cloc v 2.04  T=0.04 s (838.8 files/s, 230328.2 lines/s)
-------------------------------------------------------------------------------
Language                     files          blank        comment           code
-------------------------------------------------------------------------------
TypeScript                      36           1843             26           8016
-------------------------------------------------------------------------------
SUM:                            36           1843             26           8016
-------------------------------------------------------------------------------
```


## Computation of effort 
From timesheet.md sum all effort spent, in **ALL** activities (task1, task2, task3) at the end of the project on June 7. Exclude task4

## Computation of productivity
productivity = ((LOC of production code) + (LOC of test code)) / effort

productivity = ( 1814 + 8016 ) / 125 = 78,64


## Comparison
Report, as estimate of effort, the value obtained via activity decomposition technique.

|                      | Estimated (end of task 1) | Actual (june 7, end of task 3) | 
| -------------------- | ------------------------- | ------------------------------ |
| production code size |         unknown           |               1814             |
|    test code size    |         unknown           |               8016             |
|      total size      |           3000            |               9830             |
|        effort        |            410            |                125             |
|     productivity     |      10 loc / hour        |           78,64 loc / hour     |
